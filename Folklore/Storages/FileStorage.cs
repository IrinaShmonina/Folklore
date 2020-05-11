using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Folklore.Storages
{
    public class FileStorage : IFileStorage
    {
        private readonly Dictionary<string, (byte[], string)> files = new Dictionary<string, (byte[], string)>();
        public string Upload(Stream data, string name)
        {
            var id = Guid.NewGuid().ToString("N");

            using var ms = new MemoryStream();
            data.CopyToAsync(ms).GetAwaiter().GetResult();
            files[id] = (ms.ToArray(), name);

            return id;
        }

        public (Stream data, string name) Download(string id)
        {
            var (data, name) = files[id];

            return (new MemoryStream(data), name);
        }
    }
}
