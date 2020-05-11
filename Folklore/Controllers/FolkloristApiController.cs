using System.Collections.Generic;
using Folklore.Models;
using Folklore.Storages;
using Microsoft.AspNetCore.Mvc;

namespace Folklore.Controllers
{
    [Route("api/folklorist")]
    public class FolkloristApiController : ControllerBase
    {
        private readonly IStorage storage;

        public FolkloristApiController(IStorage storage)
        {
            this.storage = storage;
        }

        [HttpGet]
        public IEnumerable<Folklorist> GetAllFolklorists()
        {
            return storage.GetAllFolklorists();
        }

        [HttpPost]
        public Folklorist AddFolklorist([FromBody] Folklorist newFolklorist)
        {
            return storage.AddFolklorist(newFolklorist);
        }
    }
}