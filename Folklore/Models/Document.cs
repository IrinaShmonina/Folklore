using System;
using System.Collections.Generic;

namespace Folklore.Models
{
    public class Document
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string PlaceName { get; set; }
        public double? PlaceLatitude { get; set; }
        public double? PlaceLongitude { get; set; }
        public int? YearOfRecord { get; set; }
        public string AdditionalInformation { get; set; }
        public string FileName { get; set; }
        public string FileId { get; set; }
        public bool Deleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<Folklorist> Folklorists { get; set; } = new List<Folklorist>();
        public List<Informant> Informants { get; set; } = new List<Informant>();
        public List<Genres> Genres { get; set; } = new List<Genres>();
        public List<MotivationalThematicClassification> MotivationalThematicClassifications { get; set; } = new List<MotivationalThematicClassification>();
        public List<Tag> Tags { get; set; } = new List<Tag>();

        /*
        public Document(
            string title, 
            string content, 
            string placeName, 
            double placeLatitude, 
            double placeLongitude,
            int yearOfRecord,
            string additionalInformation,
            string fileName)
        {
            
            Title = title;
            Content = content;
            PlaceName = placeName;
            PlaceLatitude = placeLatitude;
            PlaceLongitude = placeLongitude;
            YearOfRecord = yearOfRecord;
            AdditionalInformation = additionalInformation;
            FileName = fileName;
            

        }
        */

    }
}