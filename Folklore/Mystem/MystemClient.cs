using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Folklore.Models;
using Newtonsoft.Json;

namespace Folklore.Mystem
{
    public class MystemClient : IMystemClient
    {
        public readonly string pathToMystem;

        public MystemClient(string pathToMystem)
        {
            this.pathToMystem = pathToMystem;
        }

        public IEnumerable<MorphInfo> Run(string text)
        {
            var workingDirectory = Guid.NewGuid().ToString("N");
            Directory.CreateDirectory(workingDirectory);

            var inputPath = Path.Combine(workingDirectory, "input");
            File.WriteAllText(inputPath, text, Encoding.UTF8);

            var outputPath = Path.Combine(workingDirectory, "output");
            File.WriteAllText(outputPath, "");

            var process = Process.Start(new ProcessStartInfo
            {
                FileName = pathToMystem,
                WorkingDirectory = workingDirectory,
                Arguments = $"-igdn --eng-gr --format json input output",
                UseShellExecute = false
            });

            process.WaitForExit();

            var result = File.ReadLines(outputPath, Encoding.UTF8)
                .Where(l => !string.IsNullOrEmpty(l))
                .Select(JsonConvert.DeserializeObject<MystemWord>)
                .Where(w => Regex.IsMatch(w.text, @"^[а-яА-ЯёЁ-]+$"))
                .Select(ConvertMystemWordToMorph)
                .ToList();

            Directory.Delete(workingDirectory, true);
            return result;
        }

        private static MorphInfo ConvertMystemWordToMorph(MystemWord mystemWord)
        {
            var analysis = mystemWord.analysis.FirstOrDefault();
            var (pos, gr) = GetPosAndGr(analysis?.gr);

            return new MorphInfo
            {
                Word = mystemWord.text,
                InitialForm = analysis?.lex ?? "",
                PartOfSpeach = pos,
                GrammaticalSigns = gr
            };
        }

        private static (string pos, string gr) GetPosAndGr(string mystemGr)
        {
            if (string.IsNullOrEmpty(mystemGr))
            {
                return ("", "");
            }

            var parts = mystemGr.Split("=");
            if (parts.Length != 2)
            {
                return ("", "");
            }

            var firstPartTokens = parts[0].Split(',');
            var pos = firstPartTokens.Length > 0 ? firstPartTokens[0] : "";

            var grFromFirstPart = firstPartTokens.Skip(1).ToList();
            var secondPartLines = parts[1].Split(new[] { '|', ')', '(' }, StringSplitOptions.RemoveEmptyEntries);
            var grCombinedLines = secondPartLines.Select(x => string.Join(",", grFromFirstPart.Concat(x.Split(','))));
            var gr = string.Join("\n", grCombinedLines);

            return (pos, gr);
        }
    }
}
