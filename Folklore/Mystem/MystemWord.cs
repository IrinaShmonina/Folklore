using System.Collections.Generic;

namespace Folklore.Mystem
{
    public class MystemWord
    {   // {"analysis":[{"lex":"привет","gr":"S,m,inan=(acc,sg|nom,sg)"}],"text":"Привет"}
        public string text { get; set; }
        public IReadOnlyList<MystemAnalysis> analysis { get; set; }
    }
}