# Knowledge

## Tech lead
- Rune Grønkjær (rune.gronkjar@co3.dk)
- Rasmus Pedersen (rasmus.pedersen@co3.dk)
  
## Umbraco Cloud
- Rasmus Pedersen (rasmus.pedersen@co3.dk)
- Camilla Skibsted (camilla.skibsted@co3.dk)

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
1. Tjek at du har adgang til Bilag-mappen på OneDrive: `\twoday\CO3-C - Documents\_Co3\Umbraco\Migration 7 to X\Bilag`

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

> **Note**
> .dll'er i `uSync lib` er bygget ud fra vores fork af uSync, hvis du skal lave ændringer til den findes det her: https://github.com/umbracocoop/uSync-Legacy

1. Opret ny branch ”migration-export”
1. Kopier nyeste version af filerne i `uSync lib` fra bilagsmappen ved denne guide til /Website/
1. I /Website/Config/Dashboard.config skal du nu tilføje
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
4. Nu skal du måske genstarte sitet
5. Reload derefter Umbraco Backoffice og gå ind på Developer sektionen, hvor der nu er en ”uSync BackOffice” fane
6. Åben nu Umbraco Cloud git repository i Fork eller hvad du bruger: \Website\wwwroot\
7. Der vil være en række filer der skal comittes:
    1. Opret en ”migration-export” branch
    1. Commit nu alt andet end:
       1. Web.config
       1. /usync/  Hvis den allerede er blevet oprettet pga. en eksport

## Eksporter indholdet - hvis man skal lave yderligere eksport

Faktisk eksporterer uSync nok alle filer ved genstart/opstart af sitet.
Filerne ender her \Website\wwwroot\uSync\data

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
   1. Website name ` [coop.dk.import] `
   1. Domæne `import.coop.dk.localhost`
   1. Physical path skal pege ind i `\uSyncMigrationSite`
1. Ret `\uSyncMigrationSite\Properties\launchSettings.json` til med ovenstående domæne to steder
1. Run `uSyncMigrationSite` projektet med `IIS` indstillingen
   1. Bemærk at du fra nu af bare kan køre domænet i browseren uden nødvendigvis at run’e den først.
1. Nu kommer du til Umbraco login skærmbilledet. Log ind med:
   1. Email: admin@co3.dk
   1. Password: 1234567890
1. Nu kommer du ind i Umbraco og er klar til næste del af opgaven

## Klargør import
1. Kopier de eksporterede filer i `\Website\wwwroot\uSync\data` til `\uSyncMigrationSite\uSync\[super-brugsen]`
1. Gå nu i Umbraco og åben Settings > uSync Migrations
1. Start ny migration ved at trykke ”Select Source”
1. Skriv ”[Super Brugsen]” i Migration name
1. Vælg din `\uSyncMigrationSite\uSync\[super-brugsen]` mappe under uSync Source
1. Tryk ”Submit”
1. Nu kører den første tjek af og convertering af filerne og viser dig hvilke datatyper der mangler converters
   1. Bemærk at man senere kan køre en ny convertion ved at trykke ”Run conversion again” under en valgt migrering

## Validation results

Første gang man laver en migration i uSync skriver den en Validation result rapport ud. Efterfølgende kan man se den ved at trykke ”Validation results” oppe under ”Edit” knappen under den migration man har åbnet.

Validation results består typisk af en række passed elementer og så eventuelt nogle Warnings. Warnings vil så typisk være på Data typer der mangler migrators. Disse migrators skal laves før uSync kan finde ud af at flytte de pågældende data. Den skal simpelthen vide hvordan den skal flytte settings og content for den pågældende data type. Mere om det længere nede.

## Hvordan fungerer uSync Migration?

Filerne fra Umbraco 7 ligger jo nu I en bestemt struktur i `\uSyncMigrationSite\uSync\[super-brugsen]` mappen. Når man kører en convertion loades alle filerne ind og uSync migration koden kører dem alle igennem. Projektet har en lang rækker Migrators, som er kode der skal til for at flytte Settings og Content for en specifik DataType. Læs mere om dem længere nede.

Når uSync migrations har kørt alle filerne igennem har den genereret en ny bunke filer med converterede data til hvad end man har været i gang med at konvertere. Disse filer ender i en mappe her `\uSyncMigrationSite\uSync\Migrations\`.

Hver gang man ændrer noget i migration koden skal man køre en ny Convertion, før man kan prøve at importere igen.

## Custom migrators

Custom migrators skal til for custom property editors. For at det vil virke skal følgende være i orden.

1. Minimum alle package.manifest filer tilhørende property editorerne i `App_Plugins` mappen skal med over i `\uSyncMigrationSite\App_Plugins\`. 
   1. Ellers findes editorerne ikke når de skal tilføjes til en data type
   2. Resten af filerne skal med, så man kan se om de virker. Der har været ændringer i brugen af Angular frameworket, så der vil i nogle tilfælde skulle justeres lidt i javascriptet.
3. Editorerne skal alle have en tilhørende Migrator. Se masser eksempler under `\uSync.Migrations\Migrators`. Custom editors skal under mappen `\uSync.Migrations\Migrators\Coop`

En migrator består af følgende overordnede dele.

1. `SyncMigrator` attribute - Står for at fortælle hvad editor alias denne migrator fungerer til
2. `GetEditorAlias()` - Står for at fortælle hvilken
3. `GetConfigValues()` - Står for at oversætte Data typens settings fra ny til gammel
4. `GetContentValue()` - Står for at overstætte Data types content data fra ny til gammel

> **Note**
> 
> De nævnte metoder kan overrides efter behov. Hvis ikke man overrider dem vil data bare blive flyttet en til en.

##  Templates
- Kopier templates view-filer over manuelt INDEN ud kører de to imports. Hvis de er kørt, så kan de bare køres igen.

## Import Settings

Settings importerer DataTypes, ContentTypes, templates, Sprog, Domæner, MediaTypes.

1. Kør en Settings import ved at trykke på den grønne knap
1. Nu importerer den alt fra den seneste konvertering
1. Den vil så komme med advarsler, hvis der er noget der ikke kom med over

> **Warning**
> 
> De datatyper der ikke har migrators vil ikke blive flyttet. Deres data vil blive flyttet over som et Label i stedet.
> Til gengæld kan man uden problemer køre en ny import efter man har kørt en ny Convertion. 
> Dog kan importen IKKE finde ud af at ændre editor på allerede oprettede data typer. Slet derfor label data typen før man forsøger at importere den igen.

## Media
- Det er kun nødvendigt at importere media én gang (Med mindre man opdager at noget er galt)
- Når man ikke længere ønsker at importere media længere, kan man omnavngive `\uSyncMigrationSite\uSync\super-brugsen\media` mappen, så den ikke bliver taget med hver gang
- Vil man se at filerne også virker kan man downloade media-mappen fra original-sitet via Azure Storage Explorer (se opsætning nedenfor) og lægge den ind i `\uSyncMigrationSite\wwwroot\`

> **Warning**
> 
> Virtual directory virker ikke med ImageSharp, så man skal have billeder i projektmappen

## Importer data i Cloud sitet

1. Klon det tomme Umbraco Cloud site ned
2. Overfør alt i `\Baseline files\` fra bilagsmappen til dit cloud site. Er det IKKE et baseline-projekt skal du i stedet kopiere alt fra App_Plugins og templates. 
3. Skift connection string i appsettings.Development.json ved at tilføje dette
     ```json
    "ConnectionStrings": {
       "umbracoDbDSN": "Server=.\\SQL_DEV;Database=coop-superbrugsen-import;User Id=sa;Password=itsteatime-",
       "umbracoDbDSN_ProviderName": "Microsoft.Data.SqlClient"
     }
     ```
4. Åben nu backoffice og gå til Settings > Deploy
5. Tryk på 'Export Schema' (Den vil teknisk kører command: `echo > deploy-export`)
6. Nu opretter projektet uda-filer for alle Settings
7. Commit filerne og se at det hele er kommet op i Umbraco Cloud, når den er færdig med comitted
8. Nu skal du transfer content fra local til live
   1. Højre klik på 'Content' og vælg 'Queue for transfer'
   2. Start overførelsen og hvis den fejler, så følg fejlbeskeden.
   3. Rinse and repeat

### Opsætning af Azure Storage Explorer
1. Installer Azure Storage Explorer https://go.microsoft.com/fwlink/?linkid=2216182&clcid=0x409
2. Klik på 'Open Connect dialog'
3. Vælg 'Blob container'
4. Vælg 'Shared access signature URL (SAS)'
5. Åbn Umbraco.io og gå til det gamle projekt
6. Under 'Settings' skal du vælge 'Connection details'
7. Scroll ned til 'Blob Storage Connection Details'
8. Kopier tekst fra 'Shared access signature URL (SAS)' fra LIVE miljøet
9. Paste det ind i 'Blob container SAS URL' i Azure Storage Explorer
10. I 'Display name' vil du overskrive Guid med følgende navngivning: [projekt navn] - LIVE. Fx. coop-base-daglibrugsen - LIVE
11. Connect og du er kørende

## Umbraco Forms

VI FLYTTER DEM BARE MANUELT. Dette kan først gøres i selve Cloud projektet, så lav flueben til det i Clickup, så du kan gøre det senere.

1. Opret den nye formular
2. Umbraco cloud laver nu en .uda fil med formularen. Gem den fil et andet sted.
3. Overskriv dens Guid, i .uda filen, med gamle guid
4. Slet formularen i Umbraco
5. Indsæt .uda filen igen
6. Kør echo deploy

> **Note**
> 
> **Uda filer** er Umbraco deploys måde at flytte Settings mellem environments. De committes til repo og bliver så automatisk importeret når de deployes til et nyt environment.

## Custom tabeller
### Url Tracker
1. Kør denne på den gamle DB:
     ```sql
     SELECT
     [icUrlTracker].RedirectNodeId AS Id,
     COALESCE([OldUrl], '') AS [Url], -- Map [RedirectUrl] from icUrlTracker to [Url] in SkybrudRedirects
     COALESCE([OldUrlQueryString], '') AS [QueryString], -- Map [OldUrlQueryString] from icUrlTracker to [QueryString] in SkybrudRedirects
     umbracoNode.uniqueID AS [DestinationKey], -- Generate a new uniqueidentifier for [DestinationKey]
     COALESCE([RedirectUrl], '') AS [DestinationUrl], -- Map [RedirectUrl] from icUrlTracker to [DestinationUrl] in SkybrudRedirects
     Inserted AS [Created], -- Use the current date/time for [Created]
     RedirectPassThroughQueryString AS [ForwardQueryString] -- Specify a value for [ForwardQueryString]
     FROM [dbo].[icUrlTracker]
     INNER JOIN umbracoNode ON umbracoNode.id = [icUrlTracker].RedirectNodeId;
     ```
2. Gem resultatet som csv ved at højreklikke på resultattabelen og vælge ”Save result as”.
3. Læg filen i mappen `\uSyncMigrationSite\UrlRedirect\ExportData`
4. Bemærk at næste step bare tager den første den bedste fil i mappen og forsøger at importere den.
5. Kør nu `/umbraco/api/ImportUrlTrackerData/Run`, hvorefter url’erne bliver importeret.

### Vote options
Tabellerne ` VoteOptions_Group` og ` VoteOptions_Vote` bliver oprettet automatisk i databasen af Migration-projektet. Du skal derfor bare kopiere data fra den gamle db, til den nye.

1.	Lav en select der vælger alle rows
2.	Marker alle rows
3.	ctrl + c
4.	Edit den samme tabel i den nye database
5.	Sæt markøren i den første række
6.	ctrl + v
7.	Hvis der er bøvl med primary key, så slå den midlertiddigt fra
