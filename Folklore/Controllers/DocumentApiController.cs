﻿using System.Collections.Generic;
using Folklore.Models;
using Folklore.Storages;
using Microsoft.AspNetCore.Mvc;

namespace Folklore.Controllers
{
    [Route("api/document")]
    public class DocumentApiController : ControllerBase
    {
        private readonly IStorage storage;

        public DocumentApiController(IStorage storage)
        {
            this.storage = storage;
        }

        public Document GetDocument([FromQuery] int id)
        {
            return storage.GetDocument(id);
        }
        [Route("all")]
        [HttpGet]
        public IEnumerable<Document> GetAllDocuments()
        {
            return storage.GetAllDocuments();
        }

        [HttpPost]
        public Document AddDocument([FromBody]Document newDocument)
        {
            return storage.AddDocument(newDocument);
        }
        
        [HttpDelete]
        public void DeleteDocument([FromQuery] int id)
        {
            storage.DeleteDocument(id);
        }
        
        [HttpGet]
        [Route("restore")]
        public void RestoreDocument([FromQuery] int id)
        {
            storage.RestoreDocument(id);
        }

        [HttpPatch]
        public Document UpdateDocument([FromBody] Document updateDocument)
        {
            return storage.UpdateDocument(updateDocument);
        }
        [Route("search")]
        [HttpGet]
        public IEnumerable<Document> SearchDocument([FromQuery] string param, string genre, string place, string yearOfRecord, string informant)
        {
            return storage.SearchDocument(param,genre,place, yearOfRecord,informant);
        }
    }
}
