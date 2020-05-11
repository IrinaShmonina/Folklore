using System.Collections.Generic;
using Folklore.Models;
using Folklore.Storages;
using Microsoft.AspNetCore.Mvc;

namespace Folklore.Controllers
{
    [Route("api/genre")]
    public class GenreApiController : ControllerBase
    {
        private readonly IStorage storage;

        public GenreApiController(IStorage storage)
        {
            this.storage = storage;
        }

        [HttpGet]
        public IEnumerable<Genres> GetAllGenres()
        {
            return storage.GetAllGenres();
        }

        [HttpPost]
        public Genres AddGenre([FromBody] Genres newGenres)
        {
            return storage.AddGenre(newGenres);
        }
    }
}