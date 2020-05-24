using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Folklore.Models;
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
    }
}
