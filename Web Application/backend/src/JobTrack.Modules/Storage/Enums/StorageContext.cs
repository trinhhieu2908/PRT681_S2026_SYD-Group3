using System.Text.Json.Serialization;

namespace JobTrack.Modules.Storage.Enums;

public enum StorageContext
{
    [JsonStringEnumMemberName("resume")]
    Resume,

    [JsonStringEnumMemberName("cover-letter")]
    CoverLetter,
}
