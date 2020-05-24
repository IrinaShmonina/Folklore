using System.Collections.Generic;
using System.Linq;
using Folklore.Models;
using Folklore.Mystem;
using Microsoft.AspNetCore.Mvc;

namespace Folklore.Controllers
{
    [Route("api/morph")]
    public class MorphApiController : ControllerBase
    {
        public readonly IMystemClient mystem;

        public MorphApiController(IMystemClient mystem)
        {
            this.mystem = mystem;
        }


        [HttpPost]
        public List<MorphInfo> Upload([FromBody]MorphRequest morphRequest)
        {
            var morphs = mystem.Run(morphRequest.Text ?? "").ToList();

            return morphs;
        }
    }
}