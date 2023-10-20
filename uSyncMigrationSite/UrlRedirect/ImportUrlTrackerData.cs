using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Linq;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Web.Common.Controllers;
using Skybrud.Umbraco.Redirects;
using Skybrud.Umbraco.Redirects.Services;
using Umbraco.Forms.Core.Providers.WorkflowTypes;
using Skybrud.Umbraco.Redirects.Models;

namespace uSyncMigrationSite.UrlRedirect {
  public class ImportUrlTrackerDataController : UmbracoApiController {
    private readonly UmbracoHelper _umbracoHelper;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IRedirectsService _redirectsService;

    public ImportUrlTrackerDataController( UmbracoHelper umbracoHelper, IWebHostEnvironment webHostEnvironment, IRedirectsService redirectsService ) {
      _umbracoHelper = umbracoHelper;
      _webHostEnvironment = webHostEnvironment;
      _redirectsService = redirectsService;
    }

    [HttpGet]
    public IActionResult Run() {
      string rtnStr = "";

      string relativePath = _webHostEnvironment.ContentRootPath + "/UrlRedirect/ExportData";
      string folderPath = Path.GetFullPath( relativePath );

      string? file = Directory.GetFiles( folderPath )?.FirstOrDefault();
      if ( file != null ) {
        string[] lines = System.IO.File.ReadAllLines( file );
        rtnStr = string.Join( "\n", lines );
        if ( lines.Length > 0 ) {
          foreach ( string line in lines ) {
            string[] columns = line.Split( new char[] { ',' }, StringSplitOptions.TrimEntries );
            if ( columns.Length == 7 && Guid.TryParse( columns[3], out Guid contentId ) ) {
              IPublishedContent? content = _umbracoHelper.Content( contentId );
              if ( content != null ) {
                string originalUrl = "/" + columns[1];
                string newUrl = content.Url();
                string[] originalUrlSplit = originalUrl.Split( new char[] { '?' }, StringSplitOptions.TrimEntries );
                originalUrl = originalUrlSplit[0];
                string originalQueryString = originalUrlSplit.Length > 1 ? originalUrlSplit[1] : "";

                if ( originalUrl == newUrl || originalUrl == newUrl.Substring( 0, newUrl.Length - 1 ) || string.IsNullOrEmpty( originalUrl ) || originalUrl == "//" ) {
                  continue;
                }

                IRedirect? redirect = _redirectsService.GetRedirectByPathAndQuery( Guid.Empty, originalUrl, originalQueryString );
                if ( redirect == null ) {
                  try {
                 
                    _redirectsService.AddRedirect( new() {
                      ForwardQueryString = columns[6] == "1",
                      OriginalUrl = originalUrl,
                      Overwrite = true,
                      Type = RedirectType.Permanent,
                      Destination = new() {
                        Url = newUrl,
                        Id = content.Id,
                        Key = content.Key,
                        Type = RedirectDestinationType.Content,
                      },
                    } );
                  } catch ( Exception ex ) {
                    throw new Exception( "originalUrl: '" + originalUrl + "' - originalQueryString: '" + originalQueryString + "' - newUrl: '" + newUrl + "' - content.Id: " + content.Id, ex );
                  }
                }
              }
            }
          }
        }
      }

      return Content( rtnStr );
    }
  }
}
