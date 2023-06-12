# uSync Migrations

uSync Migrations is a tool to help you migrate your site settings and content from Umbraco 7.x to the latest and greatest versions of Umbraco.

![](/assets/Screenshots/dashboard.png)

# Inden opstart

## Adgange
Sørg for at du har:
1. Adgang til Git projektet på https://github.com/umbracocoop/
1. Adgang til Administratoradgang til Umbraco Cloud projektet på https://www.s1.umbraco.io/
1. Du har installeret Visual Studio 2019
1. Du har installeret Visual Studio 2022
1. Du har installeret en SQLEXPRESS2019 (Skal bruges til de gamle Umbraco 7 databaser 🤷‍♂️)
1. Du har installeret SSMS
1. Du har installeret .NET 4.8
1. Du har installeret .NET 6
1. Du har installeret IIS

# Eksport det gamle Umbraco 7 projekt

Gå igennem følgende punkter for at eksportere data fra et eksisterende site.

1. Clone projektet fra Git og kald mappen ”Coop – [Super Brugsen] - Website”
1. Gå i /Website mappen og kør UaaSClone.cmd (Dette cloner Cloud projektet ned i den korrekte struktur)
   1. Første gang skal du indtaste dine umbraco.io login oplysninger

## Lav en bacpak af live databasen

Når vi kører eksporten, skal vi arbejde på en kopi af live databasen.

1. Gå ind på projektet i umbraco.io
1. Gå ind på  Settings > Connection details
1. Sørg for at din IP er i den øverste liste
1. Under ”SQL Connection Details”, skift over på “Live”
1. Indtast connection detaljerne i din SQL Management Studio
   1. HUSK at du skal indtaste ”Database” informationen under advanced
1. Gem som ”coop-[superbrugsen]-cloud.bacpak” et sted på din computer
   1. Bemærk at denne database kan indeholde personlige data og skal derfor slettes når du er færdig med at bruge den.

## Brug bacpak filen lokalt

1. Importer din bacpak filen med ”Import Data-tier Application”
   1. Navngiv databasen ”coop-[superbrugsen]-cloud”
1. Åben nu solution’en i Visual Studio 2019
1. Åben wwwroot > Web.Config
1. Udkommenter linjen `<add name="umbracoDbDSN" connectionString="Data Source=|DataDirectory|\Umbraco.sdf;Flush Interval=1;" providerName="System.Data.SqlServerCe.4.0" />`
1. Indsæt linjen og skift ud med dine egne oplysninger `<add name="umbracoDbDSN" connectionString="server=.\SQLEXPRESS19;database=coop-superbrugsen-cloud;user id=sa;password=itsteatime-" providerName="System.Data.SqlClient" />`
1. Sæt projektet i debug mode ved at sætte compilation debug="true"

## Kør sitet lokalt

1. Build din solution
1. Sæt et website op på IIS’en
   1. Website name: [coop.dk.superbrugsen]
   1. Domæne: [superbrugsen.coop.dk].localhost
   1. Physical path skal pege ind i: \Website\wwwroot
1. Åben nu [superbrugsen.coop.dk].localhost/umbraco/ i browseren
1. Log ind med din umbraco.io bruger

## Installer uSync

1. Opret ny branch ”migration-export”
1. Installer uSync https://www.nuget.org/packages/uSync/4.0.16/
1. Installer uSync Content edition https://www.nuget.org/packages/uSync.ContentEdition/4.1.9.1/
1. Build projektet
1. Kopier usync mapperne fra \Website\App_Plugins til \Website\wwwroot\App_Plugins
1. Kopier usync config filerne fra \Website\Config til \Website\wwwroot\Config
1. Kopier de to .config filer fra bilagsmappen ved denne guide til /Website/wwwroot/Config/ 
1. I Dashboard.config skal du nu tilføje
     ```xml
     <section alias="usyncBackOffice">
     <areas>
     <area>developer</area>
     </areas>
     <tab caption="uSync BackOffice">
     <control>/App_Plugins/usync/uSyncDashboard.html</control>
     </tab>
     </section>
     ```
9. Nu skal du måske genstarte sitet
10. Reload derefter Umbraco Backoffice og gå ind på Developer sektionen, hvor der nu er en ”uSync BackOffice” fane
11. Commit nu dine ændringer til ”migration-export” branchen
    1. BEMÆRK: Der ligger nogle gange en spøgelsesfil uden navn. Den skal bare have lov til at være der. Slet den ikke.
12. Åben nu Umbraco Cloud git repository i Fork eller hvad du bruger: \Website\wwwroot\
13. Der vil være en række filer der skal comittes:
    1. Opret en ”migration-export” branch
    1. Commit nu alt andet end:
       1. Web.config
       1. /usync/  Hvis den allerede er blevet oprettet pga. en eksport

## Eksporter indholdet

Faktisk eksporterer uSync nok alle filer ved genstart/opstart af sitet.
Filerne ender her\Website\wwwroot\uSync\data

Hvis ikke den har eksporteret filerne:

1. Gå ind under ”uSync BackOffice” fanen og tryk på den sorte ”Full export” knap

Nu har du ALT content og indstillinger, som du skal bruge, fra sitet.

> **Note**
> 
> I eksport gemmer den alle stier til mediefilerne, så man kan copy/paste ”media”-mappen over i det nye projekt eller lave en virtuel mappe, for ikke at have dobbelt op på billederne.

# Import

## Opsæt migration projekt

1. Clone https://github.com/umbracocoop/uSyncMigrations/ ned
1. Skift til `coop/migration` branchen
1. Opret ny branch til dit projekt og kald den `coop/[superbrugsen]`
1. import database `coop-[superbrugsen]-import` fra en af `coop-default-import` backup filerne i bilagsmappen
1. Ret connection string i \uSyncMigrationSite\appsettings.json
1. Opret website på IIS’en
   1. Website name ` [coop.dk.superbrugsen.import] `
   1. Domæne ` [import.superbrugsen.coop.dk].localhost`
   1. Physical path skal pege ind i `\uSyncMigrationSite`
1. Ret `\uSyncMigrationSite\Properties\launchSettings.json` til med ovenstående domæne to steder
1. Run `uSyncMigrationSite` projektet med `IIS` indstillingen
   1. Bemærk at du fra nu af bare kan køre domænet i browseren uden nødvendigvis at run’e den først.
1. Nu kommer du til Umbraco login skærmbilledet. Log ind med:
   1. Email: admin@co3.dk
   1. Password: 1234567890
1. Nu kommer du ind i Umbraco og er klar til næste del af opgaven



