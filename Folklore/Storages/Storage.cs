using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;
using Folklore.Models;

namespace Folklore.Storages
{
    public class Storage : IStorage
    {
        private readonly IDbConnection db;

        public Storage(IDbConnection db)
        {
            this.db = db;
        }

        #region Document

        public IEnumerable<Document> GetAllDocuments()
        {
            return db.Query<Document>(@"Select * From [dbo].[Documents] WHERE Deleted = 0");
        }

        public Document GetDocument(int id)
        {
            var sqlrdf = @"Select d.*,f.*
From [dbo].[Documents] d 
inner join [dbo].[Rels_Document_Folklorist] rdf on d.Id=rdf.DocumentId
inner join [dbo].[Folklorists] f on rdf.FolkloristId=f.Id
Where d.Id=@Id";
            var docs = db.Query<Document,Folklorist,Document>(sqlrdf, (d, f) =>
            {
                d.Folklorists.Add(f);
                return d;
            }, new {Id=id})
                .ToList();

            docs.First().Folklorists.AddRange(docs.Skip(1).SelectMany(x => x.Folklorists));
            var doc = docs.First();

            var sqlrdi = @"Select i.*
From [dbo].[Documents] d 
inner join [dbo].[Rels_Document_Informant] rdi on d.Id=rdi.DocumentId
inner join [dbo].[Informants] i on rdi.InformantId=i.Id
Where d.Id=@Id";
            var informants = db.Query<Informant>(sqlrdi, new {Id = id});
            doc.Informants.AddRange(informants);

            var sqlrdg = @"Select g.*
From [dbo].[Documents] d 
inner join [dbo].[Rels_Document_Genre] rdg on rdg.DocumentId=d.Id
inner join [dbo].[Genres] g on rdg.[GenreId]=g.Id
Where d.Id=@Id";
            var genres = db.Query<Genres>(sqlrdg, new { Id = id });
            doc.Genres.AddRange(genres);

            var sqlrdmtc = @"Select mtc.*
From [dbo].[Documents] d 
inner join [dbo].[Rels_Document_MotivationalThematicClassification] rdmtc on rdmtc.DocumentId=d.Id
inner join [dbo].[MotivationalThematicClassifications] mtc on mtc.[Id]=rdmtc.[MotivationalThematicClassificationId]
Where d.Id=@Id";
            var mtcs = db.Query<MotivationalThematicClassification>(sqlrdmtc, new { Id = id });
            doc.MotivationalThematicClassifications.AddRange(mtcs);

            var sqlrdt = @"Select t.*
From [dbo].[Documents] d 
inner join [dbo].[Rels_Document_Tag] rdt on rdt.[DocumentId]=d.Id
inner join [dbo].[Rels_Document_Tag] t on rdt.[TagId]=t.Id
Where d.Id=@Id";
            var tags = db.Query<Tag>(sqlrdt, new { Id = id });
            doc.Tags.AddRange(tags);

            return doc;
        }

        public Document UpdateDocument(Document updateDocument)
        {
            // TODO можно оптимизировать, объеденив запросы, либо отправлять одновременно
            var sqlUpdDoc = @"
UPDATE [dbo].[Documents]
SET Title=@Title, 
    Content=@Content, 
    PlaceName=@PlaceName, 
    PlaceLatitude=@PlaceLatitude, 
    PlaceLongitude=@PlaceLongitude, 
    YearOfRecord=@YearOfRecord, 
    AdditionalInformation=@AdditionalInformation, 
    FileName=@FileName,
    FileId=@FileId
WHERE Id=@Id";
            db.Query<Document>(sqlUpdDoc, new
            {
                Title = updateDocument.Title,
                Content = updateDocument.Content,
                PlaceName = updateDocument.PlaceName,
                PlaceLatitude = updateDocument.PlaceLatitude,
                PlaceLongitude = updateDocument.PlaceLongitude,
                YearOfRecord = updateDocument.YearOfRecord,
                AdditionalInformation = updateDocument.AdditionalInformation,
                FileName = updateDocument.FileName,
                FileId=updateDocument.FileId,
                Id = updateDocument.Id
            });

            // Update informants
            db.Query<int>(
                @"DELETE FROM [dbo].[Rels_Document_Informant] WHERE [DocumentId]=@Id", 
                new {Id = updateDocument.Id});

            var informantIds = new List<int>();
            foreach (var informant in updateDocument.Informants)
            {
                if (informant.Id != null)
                {
                    informantIds.Add(informant.Id.Value);
                    continue;
                }

                informantIds.Add(AddInformant(informant).Id.Value);
            }
            
            foreach (var informantId in informantIds)
            {
                db.Execute(@"
INSERT INTO [dbo].[Rels_Document_Informant] ([DocumentId],[InformantId])
VALUES (@IdDoc,@IdInf)", new {IdDoc = updateDocument.Id, IdInf = informantId});
            }


            /*
            var sqlDelF = @"DELETE FROM [dbo].[Rels_Document_Folklorist] WHERE [DocumentId]=@Id";
            db.Query<int>(sqlDelF, new {Id = updateDocument.Id});
            foreach (var f in updateDocument.Folklorists)
            {
                var sqlAddRels_Doc_F = @"INSERT INTO [dbo].[Rels_Document_Folklorist]
                    ([DocumentId],[FolkloristId])
                VALUES
                    (@IdDoc,@IdFol)";
                db.Query<int>(sqlAddRels_Doc_F, new { IdDoc = updateDocument.Id, IdFol = f.Id });
            }
            
            var sqlDelG = @"DELETE FROM [dbo].[Rels_Document_Genre] WHERE [DocumentId]=@Id";
            db.Query<int>(sqlDelG, new { Id = updateDocument.Id });
            foreach (var g in updateDocument.Genres)
            {
                var sqlAddRels_Doc_G = @"INSERT INTO [dbo].[Rels_Document_Genre]
                    ([DocumentId],[GenreId])
                VALUES
                    (@IdDoc,@IdG)";
                db.Query<int>(sqlAddRels_Doc_G, new { IdDoc = updateDocument.Id, IdG = g.Id });
            }
            var sqlDelMTC = @"DELETE FROM [dbo].[Rels_Document_MotivationalThematicClassification] WHERE [DocumentId]=@Id";
            db.Query<int>(sqlDelMTC, new { Id = updateDocument.Id });
            foreach (var m in updateDocument.MotivationalThematicClassifications)
            {
                var sqlAddRels_Doc_M = @"INSERT INTO [dbo].[Rels_Document_MotivationalThematicClassification]
                    ([DocumentId],[MotivationalThematicClassificationId])
                VALUES
                    (@IdDoc,@IdM)";
                db.Query<int>(sqlAddRels_Doc_M, new { IdDoc = updateDocument.Id, IdM = m.Id });
            }
            var sqlDelT = @"DELETE FROM [dbo].[Rels_Document_Tag] WHERE [DocumentId]=@Id";
            db.Query<int>(sqlDelT, new { Id = updateDocument.Id });
            foreach (var t in updateDocument.Tags)
            {
                var sqlAddRels_Doc_T = @"INSERT INTO [dbo].[Rels_Document_Tag]
                    ([DocumentId],[TagId])
                VALUES
                    (@IdDoc,@IdT)";
                db.Query<int>(sqlAddRels_Doc_T, new { IdDoc = updateDocument.Id, IdT = t.Id });
            }
            */

            return GetDocument(updateDocument.Id);
        }

        public void DeleteDocument(int id)
        {
            var sql = "UPDATE [dbo].[Documents] SET Deleted = 1 WHERE Id = @Id";

            db.Query<Document>(sql, new { Id = id });
        }
        public void AddDocument(Document document)
        {
            var sqlAddDoc = @"INSERT INTO [dbo].Documents
                (Title, Content, PlaceName, PlaceLatitude, PlaceLongitude, YearOfRecord, AdditionalInformation, FileName, FileId, Deleted)
            VALUES
                (@Title,@Content,@PlaceName,@PlaceLatitude,@PlaceLongitude,@YearOfRecord,@AdditionalInformation,@FileName,@FileId,0);SELECT CAST(SCOPE_IDENTITY() as int)";
            var id = db.Query<int>(sqlAddDoc, new
            {
                Title = document.Title,
                Content = document.Content,
                PlaceName = document.PlaceName,
                PlaceLatitude = document.PlaceLatitude,
                PlaceLongitude = document.PlaceLongitude,
                YearOfRecord = document.YearOfRecord,
                AdditionalInformation = document.AdditionalInformation,
                FileName = document.FileName,
                FileId=document.FileId
            }).Single();
            foreach (var f in document.Folklorists)
            {
                var sqlAddRels_Doc_F = @"INSERT INTO [dbo].[Rels_Document_Folklorist]
                    ([DocumentId],[FolkloristId])
                VALUES
                    (@IdDoc,@IdFol)";
                db.Query<int>(sqlAddRels_Doc_F, new { IdDoc = id, IdFol = f.Id });
            }
            foreach (var i in document.Informants)
            {
                var sqlAddRels_Doc_I = @"INSERT INTO [dbo].[Rels_Document_Informant]
                    ([DocumentId],[InformantId])
                VALUES
                    (@IdDoc,@IdInf)";
                db.Query<int>(sqlAddRels_Doc_I, new { IdDoc = id, IdInf = i.Id });
            }

            foreach (var g in document.Genres)
            {
                var sqlAddRels_Doc_G = @"INSERT INTO [dbo].[Rels_Document_Genre]
                    ([DocumentId],[GenreId])
                VALUES
                    (@IdDoc,@IdG)";
                db.Query<int>(sqlAddRels_Doc_G, new { IdDoc = id, IdG = g.Id });
            }

            foreach (var m in document.MotivationalThematicClassifications)
            {
                var sqlAddRels_Doc_M = @"INSERT INTO [dbo].[Rels_Document_MotivationalThematicClassification]
                    ([DocumentId],[MotivationalThematicClassificationId])
                VALUES
                    (@IdDoc,@IdM)";
                db.Query<int>(sqlAddRels_Doc_M, new { IdDoc = id, IdM = m.Id });
            }

            foreach (var t in document.Tags)
            {
                var sqlAddRels_Doc_T = @"INSERT INTO [dbo].[Rels_Document_Tag]
                    ([DocumentId],[TagId])
                VALUES
                    (@IdDoc,@IdT)";
                db.Query<int>(sqlAddRels_Doc_T, new { IdDoc = id, IdT = t.Id });
            }

        }
        #endregion
        #region Folklorist
        public IEnumerable<Folklorist> GetAllFolklorists()
        {
            var sql = @"SELECT * FROM[dbo].[Folklorists]";

            return db.Query<Folklorist>(sql);
        }

        public Folklorist AddFolklorist(Folklorist newFolklorist)
        {
            var sql = @"INSERT INTO [dbo].[Folklorists] ([FIO]]) VALUES (@FIO);SELECT CAST(SCOPE_IDENTITY() as int)";
            var id = db.Query<int>(sql, new
            {
                FIO = newFolklorist.FIO
            }).Single();
            return GetFolklorist(id);
        }

        public Folklorist GetFolklorist(int id)
        {
            var sql = @"SELECT * FROM [dbo].[Folklorists] WHERE Id=@Id";
            return db.Query<Folklorist>(sql, new { id }).Single();
        }
        #endregion
        #region Informant
        public IEnumerable<Informant> GetAllInformants()
        {
            var sql = @"SELECT * FROM[dbo].[Informants]";

            return db.Query<Informant>(sql);
        }

        public Informant AddInformant(Informant newInformant)
        {
            var sql = @"INSERT INTO [dbo].[Informants] ([FIO],[YearOfBirth]) VALUES (@FIO,@YearOfBirth);SELECT CAST(SCOPE_IDENTITY() as int)";
            var id = db.Query<int>(sql, new
            {
                FIO = newInformant.FIO,
                YearOfBirth = newInformant.YearOfBirth
            }).Single();
            return GetInformant(id);
        }
        public Informant GetInformant(int id)
        {
            var sql = @"SELECT [Id],[FIO],[YearOfBirth] FROM [dbo].[Informants] WHERE Id=@Id";
            return db.Query<Informant>(sql, new {id}).Single();

        }

        public IEnumerable<Informant> GetTopInformants(string s)
        {
            var sql = @"SELECT top(10) *  FROM [dbo].[Informants]  WHERE FIO like '%@s%'";

            return db.Query<Informant>(sql, new{s=s});
        }
        #endregion
        #region Tag
        public IEnumerable<Tag> GetAllTags()
        {
            var sql = @"SELECT * FROM[dbo].[Tags]";

            return db.Query<Tag>(sql);
        }

        public Tag AddTag(Tag newTag)
        {
            var sql = @"INSERT INTO [dbo].[Tags] (TagName) VALUES (@TagName);SELECT CAST(SCOPE_IDENTITY() as int)";
            var id = db.Query<int>(sql, new
            {
                TagName = newTag.TagName
            }).Single();
            return GetTag(id);
        }

        public Tag GetTag(int id)
        {
            var sql = @"SELECT * FROM [dbo].[Tags] WHERE Id=@Id";
            return db.Query<Tag>(sql, new { id }).Single();
        }
        #endregion
        #region Genres
        public IEnumerable<Genres> GetAllGenres()
        {
            var sql = @"SELECT * FROM[dbo].[Genres]";

            return db.Query<Genres>(sql);
        }
        public Genres AddGenre(Genres newGenres)
        {
            var sql = @"INSERT INTO [dbo].[Genres] (GenreName) VALUES (@GenreName);SELECT CAST(SCOPE_IDENTITY() as int)";
            var id = db.Query<int>(sql, new
            {
                GenreName = newGenres.GenreName
            }).Single();
            return GetGenre(id);
        }
        public Genres GetGenre(int id)
        {
            var sql = @"SELECT * FROM [dbo].[Genres] WHERE Id=@Id";
            return db.Query<Genres>(sql, new { id }).Single();
        }
        #endregion
    }
}
