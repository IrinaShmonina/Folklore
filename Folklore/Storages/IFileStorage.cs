using System;
using System.IO;

namespace Folklore.Storages
{
    public interface IFileStorage
    {
        string Upload(Stream data, string name);
        (Stream data, string name) Download(string id);
    }
}