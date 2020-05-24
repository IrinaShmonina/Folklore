using System.Collections.Generic;
using Folklore.Models;

namespace Folklore.Mystem
{
    public interface IMystemClient
    {
        IEnumerable<MorphInfo> Run(string text);
    }
}