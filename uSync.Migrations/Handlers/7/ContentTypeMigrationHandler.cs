﻿using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;

using uSync.Migrations.Services;

namespace uSync.Migrations.Handlers;

[SyncMigrtionHandler(BackOfficeConstants.Groups.Settings, uSyncMigrations.Priorities.ContentTypes, 7,
    SourceFolderName = "DocumentType",
    TargetFolderName = "ContentTypes")]
internal class ContentTypeMigrationHandler : ContentTypeBaseMigrationHandler<ContentType>, ISyncMigrationHandler
{
    public ContentTypeMigrationHandler(
        IEventAggregator eventAggregator,
        ISyncMigrationFileService migrationFileService)
        : base(eventAggregator, migrationFileService)
    { }
}
