using Microsoft.AspNetCore.Hosting;
using uSync.Migrations.Context;

namespace uSync.Migrations.Migrators.Coop {
  public static class BaselineHelper {
    public static string? GetBlockListCustomView( SyncMigrationContext context, Guid contentTypeKey, IWebHostEnvironment _webHostEnvironment ) {
      string contentTypeAlias = context.ContentTypes.GetAliasByKey( contentTypeKey );
      if ( !string.IsNullOrEmpty( contentTypeAlias ) ) {
        string fileName = contentTypeAlias + ".html";
        string relativeFilePath = _webHostEnvironment.ContentRootPath + "/App_Plugins/BlockListCustomViews/" + fileName;
        string relativeFilePathDefaultView = _webHostEnvironment.ContentRootPath + "/App_Plugins/BlockListCustomViews/default-view.html";
        string filePath = Path.GetFullPath( relativeFilePath );
        string relativeFilePathDefaultViewPath = Path.GetFullPath( relativeFilePathDefaultView );
        if ( !File.Exists( filePath ) && System.IO.File.Exists( relativeFilePathDefaultViewPath ) ) {
          string defaultViewHtml = File.ReadAllText( relativeFilePathDefaultViewPath );
          defaultViewHtml = defaultViewHtml.Replace( "{BlockName}", contentTypeAlias );

          File.WriteAllText( filePath, defaultViewHtml );
        }

        return "~/App_Plugins/BlockListCustomViews/" + fileName;
      }

      return null;
    }
  }
}
