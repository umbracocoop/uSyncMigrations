using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;
using uSync.Migrations.Composing;
using uSync.Migrations.Context;
using uSync.Migrations.Extensions;
using uSync.Migrations.Migrators.Models;
using uSync.Migrations.Models;

namespace uSync.Migrations.Migrators.Custom;

[SyncMigrator( "Umbraco.NestedContent" )]
public class NestedContentToBlockListMigrator : SyncPropertyMigratorBase
{
  Lazy<SyncPropertyMigratorCollection> _migrators;

  public NestedContentToBlockListMigrator( Lazy<SyncPropertyMigratorCollection> migrators )
  {
    _migrators = migrators;
  }

  public override string GetEditorAlias( SyncMigrationDataTypeProperty dataTypeProperty, SyncMigrationContext context )
      => UmbConstants.PropertyEditors.Aliases.BlockList;

  public override object? GetConfigValues( SyncMigrationDataTypeProperty dataTypeProperty, SyncMigrationContext context )
  {
    string contentTypes = dataTypeProperty.PreValues?.GetPreValueOrDefault( "contentTypes", "[]" ) ?? "[]";
    int maxItems = dataTypeProperty.PreValues?.GetPreValueOrDefault( "maxItems", 0 ) ?? 0;
    int singleItemMode = dataTypeProperty.PreValues?.GetPreValueOrDefault( "singleItemMode", 0 ) ?? 0;

    BlockListConfiguration.BlockConfiguration[]? blocks = JsonConvert
        .DeserializeObject<List<NestedContentConfigurationBlock>>( contentTypes )?
        .Select( x => new BlockListConfiguration.BlockConfiguration
        {
          ContentElementTypeKey = context.ContentTypes.GetKeyByAlias( x.Alias ),
          Label = x.NameTemplate,
        } )
        .ToArray();

    if (blocks?.Any() == true)
    {
      foreach (var elementTypeKey in blocks.Select( x => x.ContentElementTypeKey ))
      {
        context.ContentTypes.AddElementType( elementTypeKey );
      }
    }

    BlockListConfiguration.NumberRange validationLimit = singleItemMode == 1
         ? new() { Min = 1, Max = 1 }
         : new() { Min = 0, Max = maxItems == 0 ? null : maxItems };

    return new BlockListConfiguration
    {
      Blocks = blocks ?? Array.Empty<BlockListConfiguration.BlockConfiguration>(),
      ValidationLimit = validationLimit,
    };
  }

  public override string? GetContentValue( SyncMigrationContentProperty contentProperty, SyncMigrationContext context )
  {
    if (string.IsNullOrWhiteSpace( contentProperty.Value ))
    {
      return string.Empty;
    }

    IList<NestedContentItem>? items = JsonConvert.DeserializeObject<IList<NestedContentItem>>( contentProperty.Value );
    if (items?.Any() != true)
    {
      return string.Empty;
    }

    List<BlockItemData> contentData = new();
    List<BlockListLayoutItem> layout = new();

    foreach (NestedContentItem item in items)
    {
      string contentTypeAlias = item.ContentTypeAlias ?? "";
      Guid contentTypeKey = context.ContentTypes.GetKeyByAlias( contentTypeAlias );

      foreach (var (propertyAlias, value) in item.Values)
      {
        EditorAliasInfo? editorAlias = context.ContentTypes.GetEditorAliasByTypeAndProperty( contentTypeAlias, propertyAlias );

        if (editorAlias == null)
        {
          continue;
        }

        ISyncPropertyMigrator? migrator = _migrators.Value.FirstOrDefault( x => x.Editors.InvariantContains( editorAlias.OriginalEditorAlias ) );

        if (migrator == null)
        {
          continue;
        }

        SyncMigrationContentProperty childProperty = new( editorAlias.OriginalEditorAlias,
            contentTypeAlias, propertyAlias,
            value?.ToString() ?? string.Empty );

        item.Values[propertyAlias] = migrator.GetContentValue( childProperty, context );
      }

      BlockItemData block = new()
      {
        ContentTypeKey = contentTypeKey,
        ContentTypeAlias = item.ContentTypeAlias,
        Udi = Udi.Create( UmbConstants.UdiEntityType.Element, item.Key ),
        RawPropertyValues = item.Values,
      };

      layout.Add( new BlockListLayoutItem { ContentUdi = block.Udi } );

      contentData.Add( block );
    }

    if (!contentData.Any())
    {
      return string.Empty;
    }

    BlockValue model = new()
    {
      ContentData = contentData,
      Layout = new Dictionary<string, JToken>
        {
            { UmbConstants.PropertyEditors.Aliases.BlockList, JArray.FromObject(layout) },
        },
    };

    return JsonConvert.SerializeObject( model, Formatting.Indented );
  }

  internal class NestedContentItem
  {
    [JsonProperty( "ncContentTypeAlias" )]
    public string? ContentTypeAlias { get; set; }

    [JsonProperty( "key" )]
    public Guid Key { get; set; }

    [JsonProperty( "name" )]
    public string? Name { get; set; }

    [JsonProperty( "icon" )]
    public string? Icon { get; set; }

    [JsonExtensionData]
    public Dictionary<string, object?> Values { get; set; } = null!;
  }

  internal class NestedContentConfigurationBlock
  {
    [JsonProperty( "ncAlias" )]
    public string? Alias { get; set; }

    [JsonProperty( "nameTemplate" )]
    public string? NameTemplate { get; set; }
  }
}