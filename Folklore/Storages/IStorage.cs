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
        IEnumerable<Informant> SearchInformants(string s);
        IEnumerable<Document> SearchDocument(string s, string g, string p, string y,string i);
        IEnumerable<Genres> SearchGenres(string genre);
        IEnumerable<Folklorist> SearchFolklorist(string folklorist);
        IEnumerable<MotivationalThematicClassification> GetAllMTCs();
        IEnumerable<MotivationalThematicClassification> SearchMTCs(string mtc, string code);
        MotivationalThematicClassification AddMTC(MotivationalThematicClassification newMtc);
        IEnumerable<Tag> SearchTags(string tag);
    }
}