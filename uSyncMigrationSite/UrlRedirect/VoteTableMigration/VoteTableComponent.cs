using NPoco;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace uSyncMigrationSite.UrlRedirect.VoteTableMigration {
  public class VoteTableComposer : ComponentComposer<VoteTableComponent> {
  }

  public class VoteTableComponent : IComponent {
    private readonly ICoreScopeProvider _coreScopeProvider;
    private readonly IMigrationPlanExecutor _migrationPlanExecutor;
    private readonly IKeyValueService _keyValueService;
    private readonly IRuntimeState _runtimeState;

    public VoteTableComponent(
        ICoreScopeProvider coreScopeProvider,
        IMigrationPlanExecutor migrationPlanExecutor,
        IKeyValueService keyValueService,
        IRuntimeState runtimeState ) {
      _coreScopeProvider = coreScopeProvider;
      _migrationPlanExecutor = migrationPlanExecutor;
      _keyValueService = keyValueService;
      _runtimeState = runtimeState;
    }

    public void Initialize() {
      if ( _runtimeState.Level < RuntimeLevel.Run ) {
        return;
      }

      // Create a migration plan for a specific project/feature
      // We can then track that latest migration state/step for this project/feature
      var migrationPlan = new MigrationPlan( "VoteOptions" );

      // This is the steps we need to take
      // Each step in the migration adds a unique value
      migrationPlan.From( string.Empty )
          .To<AddVoteOptions_GroupTable>( "VoteOptions_GroupTable-db" )
          .To<AddVoteOptions_VoteTable>( "AddVoteOptions_VoteTable-db" );

      // Go and upgrade our site (Will check if it needs to do the work or not)
      // Based on the current/latest step
      var upgrader = new Upgrader( migrationPlan );
      upgrader.Execute( _migrationPlanExecutor, _coreScopeProvider, _keyValueService );
    }

    public void Terminate() {
    }
  }

  public class AddVoteOptions_GroupTable : MigrationBase {
    public AddVoteOptions_GroupTable( IMigrationContext context ) : base( context ) {
    }
    protected override void Migrate() {
      Logger.LogDebug( "Running migration {MigrationStep}", "AddVoteOptions_GroupTable" );

      // Lots of methods available in the MigrationBase class - discover with this.
      if ( TableExists( "VoteOptions_Group" ) == false ) {
        Create.Table<VoteOptions_GroupSchema>().Do();
      } else {
        Logger.LogDebug( "The database table {DbTable} already exists, skipping", "VoteOptions_Group" );
      }
    }

    [TableName( "VoteOptions_Group" )]
    [PrimaryKey( "Code" )]
    [ExplicitColumns]
    public class VoteOptions_GroupSchema {
      [PrimaryKeyColumn( AutoIncrement = false )]
      [Column( "Code" )]
      public string Code { get; set; }

      [Column( "Name" )]
      [SpecialDbType( SpecialDbTypes.NTEXT )]
      public string Name { get; set; }
    }
  }

  public class AddVoteOptions_VoteTable : MigrationBase {
    public AddVoteOptions_VoteTable( IMigrationContext context ) : base( context ) {
    }
    protected override void Migrate() {
      Logger.LogDebug( "Running migration {MigrationStep}", "AddVoteOptions_VoteTable" );

      // Lots of methods available in the MigrationBase class - discover with this.
      if ( TableExists( "VoteOptions_Vote" ) == false ) {
        Create.Table<VoteOptions_VoteSchema>().Do();
      } else {
        Logger.LogDebug( "The database table {DbTable} already exists, skipping", "VoteOptions_Vote" );
      }
    }

    [TableName( "VoteOptions_Vote" )]
    [ExplicitColumns]
    public class VoteOptions_VoteSchema {
      [Column( "Votes" )]
      public int Votes { get; set; }

      [Column( "VoteOptionContentId" )]
      public int VoteOptionContentId { get; set; }

      [Column( "VoteOptionWrapperContentId" )]
      public int VoteOptionWrapperContentId { get; set; }

      [Column( "GroupCode" )]
      [SpecialDbType( SpecialDbTypes.NVARCHARMAX )]
      public string GroupCode { get; set; }
    }
  }
}
