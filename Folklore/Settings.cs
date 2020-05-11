using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Folklore
{
    public interface ISettings
    {
        string SqlConnection { get; }
        string AzureBlobConnection { get; }
    }
    public class Settings : ISettings
    {
        public string SqlConnection { get; set; }
        public string AzureBlobConnection { get; set; }
    }
}