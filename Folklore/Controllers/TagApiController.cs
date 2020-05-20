using System.Collections.Generic;
using Folklore.Models;
using Folklore.Storages;
using Microsoft.AspNetCore.Mvc;

namespace Folklore.Controllers
{
    [Route("api/tag")]
    public class TagApiController : ControllerBase
    {
        private readonly IStorage storage;

        public TagApiController(IStorage storage)
        {
            this.storage = storage;
        }

        [HttpGet]
        public IEnumerable<Tag> GetAllTags()
        {
            return storage.GetAllTags();
        }

        [HttpPost]
        public Tag AddTag([FromBody] Tag newTag)
        {
            return storage.AddTag(newTag);
        }
        [Route("search")]
        [HttpGet]
        public IEnumerable<Tag> SearchTags([FromQuery] string tag)
        {
            return storage.SearchTags(tag);
        }
    }
}