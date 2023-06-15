using Newtonsoft.Json.Linq;
using uSync.Migrations.Context;
using uSync.Migrations.Migrators.Models;

namespace uSync.Migrations.Migrators;

[SyncMigrator( "baseline.content-relations.controller" )]
public class BaselineContentRelationsMigrator : SyncPropertyMigratorBase
{
    public override string GetEditorAlias(SyncMigrationDataTypeProperty propertyModel, SyncMigrationContext context)
        => "Umbraco.Label";

  public override object? GetConfigValues( SyncMigrationDataTypeProperty dataTypeProperty, SyncMigrationContext context ) {
    var config = new JObject {
      { "umbracoDataValueType", "STRING" }
    };
    return config;
  }

  public override string? GetContentValue( SyncMigrationContentProperty contentProperty, SyncMigrationContext context ) {
    return "SKAL SLETTES SENERE";
  }
}