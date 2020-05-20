using System.Collections.Generic;
using Folklore.Models;
using Folklore.Storages;
using Microsoft.AspNetCore.Mvc;

namespace Folklore.Controllers
{
    [Route("api/mtc")]
    public class MTCApiController : ControllerBase
    {
        private readonly IStorage storage;

        public MTCApiController(IStorage storage)
        {
            this.storage = storage;
        }

        [HttpGet]
        public IEnumerable<MotivationalThematicClassification> GetAllMTCs()
        {
            return storage.GetAllMTCs();
        }
        [Route("search")]
        [HttpGet]
        public IEnumerable<MotivationalThematicClassification> SearchMTCs([FromQuery] string mtc, string code)
        {
            return storage.SearchMTCs(mtc, code);
        }

        [HttpPost]
        public MotivationalThematicClassification AddMTC([FromBody] MotivationalThematicClassification newMTC)
        {
            return storage.AddMTC(newMTC);
        }
    }
}