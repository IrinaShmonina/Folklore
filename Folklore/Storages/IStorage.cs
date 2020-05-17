using System.Collections.Generic;
using Folklore.Models;

namespace Folklore.Storages
{
    public interface IStorage
    {
        IEnumerable<Document> GetAllDocuments();
        Document AddDocument(Document document);
        void DeleteDocument(int id);
        IEnumerable<Folklorist> GetAllFolklorists();
        Folklorist AddFolklorist(Folklorist newFolklorist);
        IEnumerable<Informant> GetAllInformants();
        Informant AddInformant(Informant newInformant);
        IEnumerable<Tag> GetAllTags();
        Tag AddTag(Tag newTag);
        IEnumerable<Genres> GetAllGenres();
        Genres AddGenre(Genres newGenres);
        Document GetDocument(int id);
        Document UpdateDocument(Document updateDocument);
        IEnumerable<Informant> GetTopInformants(string s);
        IEnumerable<Document> SearchDocument(string s);
    }
}