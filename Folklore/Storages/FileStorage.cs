using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Folklore.Storages
{
    public class FileStorage : IFileStorage
    {
        private const string FileNameKey = "fileName";
        private const string DocumentsContainerName = "documents";
        
        private readonly BlobServiceClient blobClient;

        public FileStorage(BlobServiceClient blobClient)
        {
            this.blobClient = blobClient;
        }
        
        public string Upload(Stream data, string name)
        {
            var id = Guid.NewGuid().ToString("N");
            var containerClient = GetBlobContainerClient();
            containerClient.UploadBlobAsync(id, data).GetAwaiter().GetResult();
            containerClient.GetBlobClient(id).SetMetadata(new Dictionary<string, string> { [FileNameKey] = name });
            
            return id;
        }

        public (Stream data, string name) Download(string id)
        {
            var containerClient = GetBlobContainerClient();
            var blobClient = containerClient.GetBlobClient(id);
            if (!blobClient.Exists())
            {
                throw new ArgumentException($"Blob not found'{id}'");
            }
            
            var data = blobClient.Download().Value.Content;
            
            var metadata = blobClient.GetProperties().Value.Metadata;

            return (data, metadata[FileNameKey]);
        }

        private BlobContainerClient GetBlobContainerClient()
        {
            var containerClient = blobClient.GetBlobContainerClient(DocumentsContainerName);
            containerClient.CreateIfNotExists(PublicAccessType.Blob);

            return containerClient;
        }
    }
}
