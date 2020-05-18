using System.Collections.Generic;
using Folklore.Models;
using Folklore.Storages;
using Microsoft.AspNetCore.Mvc;

namespace Folklore.Controllers
{
    [Route("api/informant")]
    public class InformantApiController : ControllerBase
    {
        private readonly IStorage storage;

        public InformantApiController(IStorage storage)
        {
            this.storage = storage;
        }

        [HttpGet]
        public IEnumerable<Informant> GetAllFolklorists()
        {
            return storage.GetAllInformants();
        }

        [Route("search")]
        [HttpGet]
        public IEnumerable<Informant> SearchInformants([FromQuery] string informant)
        {
            return storage.SearchInformants(informant);
        }

        [HttpPost]
        public Informant AddInformant([FromBody] Informant newInformant)
        {
            return storage.AddInformant(newInformant);
        }
    }
}