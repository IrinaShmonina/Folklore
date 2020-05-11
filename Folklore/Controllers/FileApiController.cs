using Folklore.Storages;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace Folklore.Controllers
{
    [Route("api/file")]
    public class FileApiController : ControllerBase
    {
        private readonly IFileStorage fileStorage;
        private static readonly IContentTypeProvider contentTypeProvider = new FileExtensionContentTypeProvider();

        public FileApiController(IFileStorage fileStorage)
        {
            this.fileStorage = fileStorage;
        }

        [HttpGet]
        public FileResult Download(string id)
        {
            var (data, name) = fileStorage.Download(id);
            
            return new FileStreamResult(data, GetContentType(name))
            {
                FileDownloadName = name
            };
        }

        [HttpPost]
        public object Upload([FromQuery]string name)
        {
            using var body = Request.Body;
            var id = fileStorage.Upload(body, name);

            return new {id};
        }

        private static string GetContentType(string fileName)
        {
            return !contentTypeProvider.TryGetContentType(fileName, out var contentType) 
                ? "application/octet-stream" 
                : contentType;
        }
    }
}