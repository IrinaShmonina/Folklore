using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
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
            return db.Query<Document>(@"Select TOP(200) * From [dbo].[Documents] WHERE Deleted = 0 order by [CreatedAt] desc");
        }

        public Document GetDocument(int id)
        {
            var doc = db.Query<Document>(@"
Select *
From [dbo].[Documents] d 
Where d.Id=@Id
", new {Id = id}).Single();

            var sqlrdf = @"Select f.*
From [dbo].[Documents] d 
inner join [dbo].[Rels_Document_Folklorist] rdf on d.Id=rdf.DocumentId
inner join [dbo].[Folklorists] f on rdf.FolkloristId=f.Id
Where d.Id=@Id";
            var folklorists = db.Query<Folklorist>(sqlrdf, new {Id=id});
            doc.Folklorists.AddRange(folklorists);

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
inner join [dbo].[Tags] t on rdt.[TagId]=t.Id
Where d.Id=@Id";
            var tags = db.Query<Tag>(sqlrdt, new { Id = id });
            doc.Tags.AddRange(tags);

            var m = db.Query<string>(@"
Select Analysis From [dbo].[Morph] d 
Where d.DocumentId=@Id
", new { Id = id }).FirstOrDefault();
            
            doc.Morph = m;
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
            db.Execute(sqlUpdDoc, new
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

            UpdateInformants(updateDocument);
            UpdateFolklorists(updateDocument);
            UpdateTags(updateDocument);
            UpdateGenres(updateDocument);
            UpdateMTC(updateDocument);
            UpdateMorph(updateDocument);
            
            return GetDocument(updateDocument.Id);
        }

        private void UpdateMorph(Document updateDocument)
        {
            db.Execute(@"IF EXISTS(SELECT * FROM [dbo].[Morph] WHERE [DocumentId] = @id)
   UPDATE [dbo].[Morph] SET [Analysis] = @m WHERE [DocumentId] = @id
ELSE INSERT INTO [dbo].[Morph] ([DocumentId],[Analysis]) VALUES (@id,@m)",
                new {id = updateDocument.Id, m = updateDocument.Morph});
        }

        private void UpdateMTC(Document updateDocument)
        {
            db.Execute(
                @"DELETE FROM [dbo].[Rels_Document_MotivationalThematicClassification] WHERE [DocumentId]=@Id",
                new { Id = updateDocument.Id });

            var mtcIds = new List<int>();
            foreach (var mtc in updateDocument.MotivationalThematicClassifications)
            {
                if (mtc.Id != null)
                {
                    mtcIds.Add(mtc.Id.Value);
                    continue;
                }

                mtcIds.Add(AddMotivationalThematicClassification(mtc).Id.Value);
            }

            foreach (var mtcId in mtcIds)
            {
                db.Execute(@"
INSERT INTO [dbo].[Rels_Document_MotivationalThematicClassification] ([DocumentId],[MotivationalThematicClassificationId])
VALUES (@IdDoc,@IdG)", new { IdDoc = updateDocument.Id, IdG = mtcId });
            }
        }

        private void UpdateGenres(Document updateDocument)
        {
            db.Execute(
                @"DELETE FROM [dbo].[Rels_Document_Genre] WHERE [DocumentId]=@Id",
                new { Id = updateDocument.Id });

            var genresIds = new List<int>();
            foreach (var genre in updateDocument.Genres)
            {
                if (genre.Id != null)
                {
                    genresIds.Add(genre.Id.Value);
                    continue;
                }

                genresIds.Add(AddGenre(genre).Id.Value);
            }

            foreach (var genresId in genresIds)
            {
                db.Execute(@"
INSERT INTO [dbo].[Rels_Document_Genre] ([DocumentId],[GenreId])
VALUES (@IdDoc,@IdG)", new {IdDoc = updateDocument.Id, IdG = genresId});
            }
        }

        private void UpdateTags(Document updateDocument)
        {
            db.Execute(
                @"DELETE FROM [dbo].[Rels_Document_Tag] WHERE [DocumentId]=@Id",
                new { Id = updateDocument.Id });

            var tagIds = new List<int>();
            foreach (var tag in updateDocument.Tags)
            {
                if (tag.Id != null)
                {
                    tagIds.Add(tag.Id.Value);
                    continue;
                }

                tagIds.Add(AddTag(tag).Id.Value);
            }

            foreach (var tagId in tagIds)
            {
                db.Execute(@"
INSERT INTO [dbo].[Rels_Document_Tag] ([DocumentId],[TagId])
VALUES (@IdDoc,@IdT)", new {IdDoc = updateDocument.Id, IdT = tagId});
            }
        }

        private void UpdateFolklorists(Document updateDocument)
        {
            db.Execute(
                @"DELETE FROM [dbo].[Rels_Document_Folklorist] WHERE [DocumentId]=@Id",
                new { Id = updateDocument.Id });

            var folkloristIds = new List<int>();
            foreach (var folklorist in updateDocument.Folklorists)
            {
                if (folklorist.Id != null)
                {
                    folkloristIds.Add(folklorist.Id.Value);
                    continue;
                }

                folkloristIds.Add(AddFolklorist(folklorist).Id.Value);
            }

            foreach (var folkloristId in folkloristIds)
            {
                db.Execute(@"
INSERT INTO [dbo].[Rels_Document_Folklorist] ([DocumentId],[FolkloristId])
VALUES (@IdDoc,@IdFol)", new {IdDoc = updateDocument.Id, IdFol = folkloristId});
            }
        }

        private void UpdateInformants(Document updateDocument)
        {
            db.Execute(
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
        }

        public void DeleteDocument(int id)
        {
            var sql = "UPDATE [dbo].[Documents] SET Deleted = 1 WHERE Id = @Id";

            db.Query<Document>(sql, new { Id = id });
        }
        public Document AddDocument(Document document)
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

            document.Id = id;
            UpdateDocument(document);
            return GetDocument(id);
        }
        public IEnumerable<Document> SearchDocument(string str, string genre, string place, string yearOfRecord,string informant)
        {
            var s = "%" + str + "%";
            var sql = @"SELECT TOP(200) * FROM [dbo].[Documents] WHERE (Title like @s OR Content like @s)";
            if (!string.IsNullOrEmpty(genre))
            {
                sql += @"AND Id in 
(SELECT[DocumentId] FROM[dbo].[Rels_Document_Genre] WHERE[GenreId] in
    (SELECT[Id] FROM[dbo].[Genres] WHERE[GenreName] like @g))";
            }
            var g = "%" + genre + "%";
            if (!string.IsNullOrEmpty(place))
            {
                sql += @"AND PlaceName like @p";
            }
            var p = "%" + place + "%";
            if (!string.IsNullOrEmpty(yearOfRecord))
            {
                sql += @"AND YearOfRecord=@y";
            }
            int.TryParse(yearOfRecord, out var y);
            if (!string.IsNullOrEmpty(informant))
            {
                sql += @"AND Id in 
(SELECT[DocumentId] FROM[dbo].[Rels_Document_Informant] WHERE [InformantId] in
    (SELECT[Id] FROM [dbo].[Informants] WHERE [FIO] like @i))";
            }
            var i = "%" + informant + "%";
            return db.Query<Document>(sql, new { s = s ,g = g, p=p, y=y,i=i});
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
            var sql = @"INSERT INTO [dbo].[Folklorists] ([FIO]) VALUES (@FIO);SELECT CAST(SCOPE_IDENTITY() as int)";
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

        public IEnumerable<Folklorist> SearchFolklorist(string folklorist)
        {
            var sql = @"SELECT  *  FROM [dbo].[Folklorists]  WHERE FIO like @s";
            var s = '%' + folklorist + '%';

            return db.Query<Folklorist>(sql, new { s = s });
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
        public MotivationalThematicClassification AddMotivationalThematicClassification(MotivationalThematicClassification newMTC)
        {
            var sql = @"INSERT INTO [dbo].[MotivationalThematicClassifications] ([Code],[ClassificationName]) VALUES
           (@Code,@ClassificationName);SELECT CAST(SCOPE_IDENTITY() as int)";
            var id = db.Query<int>(sql, new
            {
                Code = newMTC.Code,
                ClassificationName = newMTC.ClassificationName
            }).Single();
            return GetMotivationalThematicClassification(id);
        }

        public MotivationalThematicClassification GetMotivationalThematicClassification(int id)
        {
            var sql = @"SELECT * FROM [dbo].[MotivationalThematicClassifications] WHERE Id=@Id";
            return db.Query<MotivationalThematicClassification>(sql, new { id }).Single();
        }
        public Informant GetInformant(int id)
        {
            var sql = @"SELECT [Id],[FIO],[YearOfBirth] FROM [dbo].[Informants] WHERE Id=@Id";
            return db.Query<Informant>(sql, new {id}).Single();

        }

        public IEnumerable<Informant> SearchInformants(string str)
        {
            var sql = @"SELECT  *  FROM [dbo].[Informants]  WHERE FIO like @s";
            var s = '%' + str + '%';

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

        public IEnumerable<Tag> SearchTags(string tag)
        {
            var s = "%" + tag + "%";
            var sql = @"SELECT *  FROM [dbo].[Tags]
where [TagName] like @s";

            return db.Query<Tag>(sql, new { s = s });
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

        public IEnumerable<Genres> SearchGenres(string str)
        {
            var s = "%" + str + "%";
            var sql = @"SELECT [Id],[GenreName]  FROM [dbo].[Genres]
where [GenreName] like @s";
            
            return db.Query<Genres>(sql, new { s = s});
        }
        #endregion

        public IEnumerable<MotivationalThematicClassification> GetAllMTCs()
        {
            var sql = @"SELECT * FROM [dbo].[MotivationalThematicClassifications]";

            return db.Query<MotivationalThematicClassification>(sql);
        }

        public IEnumerable<MotivationalThematicClassification> SearchMTCs(string mtc, string code)
        {
            var sql = @"SELECT *
  FROM [dbo].[MotivationalThematicClassifications]
  Where [ClassificationName] like @m or [Code] like @c";
            var m = '%' + mtc + '%';
            var c = '%' + code + '%';

            return db.Query<MotivationalThematicClassification>(sql, new { m = m,c=c });
        }

        public MotivationalThematicClassification AddMTC(MotivationalThematicClassification newMtc)
        {
            var sql = @"INSERT INTO [dbo].[MotivationalThematicClassifications] ([Code],[ClassificationName])
VALUES (@Code,@ClassificationName);SELECT CAST(SCOPE_IDENTITY() as int)";
            var id = db.Query<int>(sql, new
            {
                Code = newMtc.Code,
                ClassificationName = newMtc.ClassificationName
            }).Single();
            return GetMTC(id);
        }

        public MotivationalThematicClassification GetMTC(int id)
        {
            var sql = @"SELECT * FROM [dbo].[MotivationalThematicClassifications] WHERE Id=@Id";
            return db.Query<MotivationalThematicClassification>(sql, new { id }).Single();
        }
    }
}
