﻿using Newtonsoft.Json.Linq;
using SixLabors.ImageSharp;
using System;
using System.Drawing;
using System.Text.RegularExpressions;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;
using uSync.Migrations.Context;
using uSync.Migrations.Extensions;
using uSync.Migrations.Migrators.Models;
using static System.Net.Mime.MediaTypeNames;

namespace uSync.Migrations.Migrators;

[SyncMigrator( UmbConstants.PropertyEditors.Aliases.TinyMce, typeof( RichTextConfiguration ), IsDefaultAlias = true )]
[SyncMigrator( "Umbraco.TinyMCEv3" )]
public class RichTextBoxMigrator : SyncPropertyMigratorBase {
  public override object? GetConfigValues( SyncMigrationDataTypeProperty dataTypeProperty, SyncMigrationContext context ) {
    if ( dataTypeProperty.PreValues?.Count > 0 ) {
      var config = new RichTextConfiguration().MapPreValues( dataTypeProperty.PreValues ) as RichTextConfiguration;

      if ( config is not null ) {
        if ( config.Editor is JObject editor ) {
          var toolbar = editor["toolbar"] as JArray;
          if ( toolbar?.Count > 0 ) {
            var replacements = new Dictionary<string, string>
            {
                            { "code", "ace" },
                            { "styleselect", "styles" },
                        };

            foreach ( var replacement in replacements ) {
              var idx = toolbar.FindIndex( x => replacement.Key.Equals( x.ToString() ) == true );
              if ( idx >= 0 ) {
                toolbar.RemoveAt( idx );
                toolbar.Insert( idx, replacement.Value );
              }
            }
          }

          var stylesheets = editor["stylesheets"] as JArray;
          if ( stylesheets?.Count > 0 ) {
            for ( int i = 0; i < stylesheets.Count; i++ ) {
              stylesheets[i].Replace( $"/css/{stylesheets[i]}.css" );
            }
          }

          if ( editor["mode"] is null ) {
            editor["mode"] = "classic";
          }
        }

        if ( config.OverlaySize is null ) {
          config.OverlaySize = "small";
        }
      }

      return config;
    }

    return base.GetConfigValues( dataTypeProperty, context );
  }

  public override string? GetContentValue( SyncMigrationContentProperty contentProperty, SyncMigrationContext context ) {

    var richTextValue = string.Empty;
    if ( string.IsNullOrWhiteSpace( contentProperty.Value ) == false ) {
      richTextValue = GuidExtensions.LocalLink2Udi( contentProperty.Value );
    }

    string pattern = @"<img.*data-udi=""(umb://media.*)"".*>";

    Match m = Regex.Match( richTextValue, pattern, RegexOptions.IgnoreCase );

    if ( m.Success ) {

      //Get umb://media.*
      Group g = m.Groups[1];

      if ( g.Success && !string.IsNullOrEmpty( g.ToString() ) ) {
        List<string> splitOn = g.ToString().Split( "/" ).ToList();

        string? mediaUda = splitOn.LastOrDefault();

        if ( Guid.TryParse( mediaUda, out Guid guid ) == false && UdiParser.TryParse<GuidUdi>( mediaUda, out var udi ) == true ) {
          guid = udi.Guid;
        }

        string doesGuidExist = context.Content.GetAliasByKey( guid );

        if ( string.IsNullOrEmpty( doesGuidExist ) ) {
          string replacedStr = Regex.Replace( richTextValue, pattern, "" );

          richTextValue = replacedStr;
        }

      }


    }

    return richTextValue;
  }
}