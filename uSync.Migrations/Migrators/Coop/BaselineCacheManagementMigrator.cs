using uSync.Migrations.Context;
using uSync.Migrations.Migrators.Models;

namespace uSync.Migrations.Migrators;

[SyncMigrator( "Baseline.CacheManagement" )]
public class BaselineCacheManagementMigrator : SyncPropertyMigratorBase
{
    public override string GetEditorAlias(SyncMigrationDataTypeProperty propertyModel, SyncMigrationContext context)
        => "Baseline.CacheManagement";
}