﻿using Umbraco.Cms.Core.PropertyEditors;

namespace uSync.Migrations.Migrators;

[SyncMigrator( UmbConstants.PropertyEditors.Aliases.TinyMce, typeof( RichTextConfiguration ), IsDefaultAlias = true )]
[SyncMigrator( "Umbraco.TinyMCEv3" )]
public class RichTextBoxMigrator : SyncPropertyMigratorBase { }
