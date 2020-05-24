using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Folklore;
using Folklore.Models;
using Folklore.Mystem;
using Newtonsoft.Json;

namespace DatabaseFiller
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var uri = "https://folklore20200522003446.azurewebsites.net/api/document";
            var client = new HttpClient();
            var docs = JsonConvert.DeserializeObject<Document[]>(File.ReadAllText(@"C:\Git\Folklore\DatabaseFiller\docs.json"));
            foreach (var d in docs)
            {
                var jsonInString = JsonConvert.SerializeObject(d);
                await client.PostAsync(uri, new StringContent(jsonInString, Encoding.UTF8, "application/json"));
            }
            
            //var resp = await client.GetAsync("https://folklore20200522003446.azurewebsites.net/api/document/all");
            //var respStr = await resp.Content.ReadAsStringAsync();
            //var documents = JsonConvert.DeserializeObject<Document[]>(respStr);
            //JsonConvert.SerializeObject();
            //Console.WriteLine(resp);
        }

        static void MystemTest()
        {
            var c = new MystemClient(@"res\mystem.exe");

            var res = c.Run("Привет мир, тут какой-то текст для теста майстема").ToList();
        }
    }
}
