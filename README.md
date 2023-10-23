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
1. Du har installeret Visual Studio 2022
1. Du har installeret en SQLEXPRESS2019 (Skal bruges til de gamle Umbraco 7 databaser 🤷‍♂️)
1. Du har installeret SSMS
1. Du har installeret Microsoft Azure Storage Explorer
1. Du har installeret .NET 4.8
1. Du har installeret .NET 6
1. Du har installeret IIS
1. Tjek at du har adgang til Bilag-mappen på OneDrive: `\twoday\CO3-C - Documents\_Co3\Umbraco\Migration 7 to X\Bilag`

# Eksport det gamle Umbraco 7 projekt

Gå igennem følgende punkter for at eksportere data fra et eksisterende site.

1. Clone projektet fra Git og kald mappen ”Coop – [Super Brugsen] - Website”
1. Gå i /Website mappen og kør UaaSClone.cmd (Dette cloner Cloud projektet ned i den korrekte struktur)
   1. Første gang skal du indtaste dine umbraco.io login oplysninger

## Lav en bacpac af live databasen

Når vi kører eksporten, skal vi arbejde på en kopi af live databasen.

1. Gå ind på projektet i umbraco.io
1. Gå ind på  Settings > Connection details
1. Sørg for at din IP er i den øverste liste
1. Under ”SQL Connection Details”, skift over på “Live”
1. Indtast connection detaljerne i din SQL Management Studio
   1. HUSK at du skal indtaste ”Database” informationen under advanced
1. Gem som ”coop-[superbrugsen]-cloud.bacpac” et sted på din computer
   1. Bemærk at denne database kan indeholde personlige data og skal derfor slettes når du er færdig med at bruge den.

## Brug bacpac filen lokalt
> **Note**
> Hvis det er en frisk installation af SQL Server, så kør den her stump i en query inden import af bacpac:
> sp_configure 'contained database authentication', 1; GO RECONFIGURE; GO

1. Importer din bacpac filen med ”Import Data-tier Application”
   1. Navngiv databasen ”coop-[superbrugsen]-cloud”
1. Åben nu solution’en i Visual Studio
1. Åben wwwroot > Web.Config
1. Udkommenter linjen `<add name="umbracoDbDSN" connectionString="Data Source=|DataDirectory|\Umbraco.sdf;Flush Interval=1;" providerName="System.Data.SqlServerCe.4.0" />`
1. Indsæt linjen og skift ud med dine egne oplysninger `<add name="umbracoDbDSN" connectionString="server=.\SQLEXPRESS19;database=coop-superbrugsen-cloud;user id=sa;password=itsteatime-" providerName="System.Data.SqlClient" />`
1. Sæt projektet i debug mode ved at sætte compilation debug="true"

## Kør sitet lokalt

1. Build din solution
1. Sæt et website op på IIS’en
   1. Website name: [coop.dk.superbrugsen].v7
   1. Domæne: v7.[superbrugsen.coop.dk].localhost
   1. Physical path skal pege ind i: \Website\wwwroot
1. Åben nu [superbrugsen.coop.dk].localhost/umbraco/ i browseren
1. Log ind med din umbraco.io bruger

## Installer uSync

> **Note**
> .dll'er i `uSync lib` er bygget ud fra vores fork af uSync, hvis du skal lave ændringer til den findes det her: https://github.com/umbracocoop/uSync-Legacy

1. Opret ny branch ”migration-export”
1. Kopier nyeste version af filerne i `uSync lib` fra bilagsmappen ved denne guide til /Website/wwwroot/
1. I /Website/wwwroot/Config/Dashboard.config skal du nu tilføje
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
1. Nu skal du måske genstarte sitet
1. Reload derefter Umbraco Backoffice og gå ind på Developer sektionen, hvor der nu er en ”uSync BackOffice” fane
1. Commit nu dine ændringer til ”migration-export” branchen
    1.	!!! BEMÆRK !!!: Der ofte en spøgelsesfil uden navn. Den skal bare have lov til at være der. Slet den ikke. Hvis du gør, fjernes sikkert alt i wwwroot og du skal hente det ned igen.
 
1. Åben nu Umbraco Cloud git repository i Fork eller hvad du bruger: \Website\wwwroot\
1. Der vil være en række filer der skal comittes:
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

## Clone det nye Cloud site ned
1.	Åben ‘coop-marketing-base' på umbraco.io
2.	Click på det lille ‘here’ link under projektnavnet
3.	Vælg dit nye projekt og skub ændringer ud på det
4.	Gå ind på det nye projekt i umbraco.io
5.	Tryk på ‘live’ og ‘Clone project’
6.	Kopier linket og clone det ned i Fork (Eller hvad du nu bruger til source control)

> **Note**
> 
> I eksport gemmer den alle stier til mediefilerne, så man kan copy/paste ”media”-mappen over i det nye projekt eller lave en virtuel mappe, for ikke at have dobbelt op på billederne.

# Import

## Opsæt migration projekt

1. Clone https://github.com/umbracocoop/uSyncMigrations/ ned
1. Skift til `coop/migration` branchen
1. Opret ny branch til dit projekt og kald den `coop/[superbrugsen]`
1. Database
   - IKKE BASELINE
      1. Import database `coop-[superbrugsen]-import` fra en bacpac af ny live projekt. Se toppen af README for guide af bacpac.
   - BASELINE
      1. Lav nu en bacpac af databasen på dit nye site (Se ‘Lav en bacpac af live databasen’)
         1. Importer backpak’en i din lokale SQLEXPRESS database
      1. Ret nu login for din user
         1.	Åben tabellen ‘umbracoUser’ i edit mode
         1.	Din Cloud bruger burde være deri, men med et ubrugeligt password
         1.	Kopier nu password fra en tilsvarende database, som du kender. Følgende felter skal overskrives: userPassword, passwordConfig, securityStampToken
      1. Sørg nu for at Umbracos Starter Kit ikke bliver installeret
         1.	Åben ‘umbracoKeyValue’ tabellen i edit mode
         1.	Indsæt linjen:
            1. Key: Umbraco.Core.Upgrader.State+The-Starter-Kit
            1. Value: a2a11bdf-1a21-4ce0-9e8e-d1d040fd503a
            1. Updated: indsæt en pæn dato
           
         1. Hvis linjen allerede findes opdater da value.
      1. Tag nu en backup af databasen
1. Ret connection string i \uSyncMigrationSite\appsettings.json
1. Opret website på IIS’en. Vi bruger samme website til alle migrations
   1. Website name ` [coop.dk.import] `
   1. Domæne `import.coop.dk.localhost`
   1. Physical path skal pege ind i `\uSyncMigrationSite`
1. Ret `\uSyncMigrationSite\Properties\launchSettings.json` til med ovenstående domæne to steder
1. Højreklik først på uSyncMigrationSite og vælg "Set as Startup Project"
1. Run `uSyncMigrationSite` projektet med `IIS` indstillingen
   1. Bemærk at du fra nu af bare kan køre domænet i browseren uden nødvendigvis at run’e den først.
   1. Hvis Umbraco begynder at ville lave en opdateringen, så er det fordi at Umbraco versionen i migration projektet ikke stemmer overens med den versionen i databasen. Opdatér Umbraco versionen i migration projektet ved at opdatere Umbraco relaterede nuget pakker.
1. Nu kommer du til Umbraco loginskærmbilledet. Log ind med:
   1. Email: admin@co3.dk (Eller hvilket login du tog)
   1. Password: 1234567890 (Eller hvilket password du tog)
1. Nu kommer du ind i Umbraco og er klar til næste del af opgaven
1. Tjek at der er intet indhold + dokumenttyperne fra databasen er i Umbraco som det eneste. 
1. Ret login og password på din bruger til ovenstående
1. Tag en ny backup af databasen
1. Du er nu klar til næste del af opgaven

## Klargør import
1. Kopier de eksporterede filer i `\Website\wwwroot\uSync\data` til `\uSyncMigrationSite\uSync\[super-brugsen]`
1. Download nu mediafilerne fra blob-storage
   1. I umbraco.io projektet åbner du Connection Details og scroller ned til Blob Storage Connection Details
   1. Vælg Live
   1. Kopier url’en i Shared access signature URL (SAS)
   1. Åben Microsoft Azure Storage Explorer
   1. Vælg Connect to Azure Storage (Ikonet med strømstikket)
   1. Vælg Blob Container
   1. Vælg Shared access signature URL (SAS)
   1. Skriv [Super Brugsen Media] i Display name
   1. Paste din Url i Blob container SAS URL
   1. Next
   1. Download nu media-mappen til \uSyncMigrationSite\wwwroot\media\
1. Gå nu i Umbraco via import-projektet og åben Settings > uSync Migrations
1. Start ny migration ved at trykke ”Select Source”
1. Skriv ”[Super Brugsen]” i Migration name
1. Vælg din `\uSyncMigrationSite\uSync\[super-brugsen]` mappe under uSync Source
1. Skiv ‘uSync/Migrations/[super-brugsen]’ under ‘Target Location’
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
- Kopier templates view-filer over i dit uSync projekt manuelt INDEN du kører de to imports. Hvis de er kørt, så kan de bare køres igen.

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
3. Skift connection string i appsettings.Development.json ved at tilføje dette
     ```json
    "ConnectionStrings": {
       "umbracoDbDSN": "Server=.\\SQL_DEV;Database=coop-superbrugsen-import;User Id=sa;Password=itsteatime-",
       "umbracoDbDSN_ProviderName": "Microsoft.Data.SqlClient"
     }
     ```
4. Omnavngiv projektmappen under `src` fra `UmbracoProject` til `Website`.
5. Omnavngiv projektfilen (.csproj)    fra `UmbracoProject` til `Website`. Den er under mappen fra step 3.
6. Åben projektet i VS2022
7. Gem din .sln-fil - giv den et navn, der matcher fra Umbraco.io. Husk `.sln`-bagefter.
8. Åben `Properties\launchSettings.json`
9. Tilføj følgende under `iisSettings`. Husk at opdatere `applicationUrl` - den skal være med https.
     ```json
      "iis": {
        "applicationUrl": "https://skolekontakten.dk.coop.new.localhost/",
        "sslPort": 0
    },
     ```
9. Tilføj følgende under `profiles`. Husk at opdatere `launchUrl` - den skal være med https.

     ```json 
        "IIS": {
        "commandName": "IIS",
        "launchBrowser": true,
        "launchUrl": "https://skolekontakten.dk.coop.new.localhost/",
        "environmentVariables": {
          "ASPNETCORE_ENVIRONMENT": "Development"
        }
      },
   ```

10. Opsæt sitet på din IIS med et passende domæne. Start med en normal http binding.
11. Tilføj en https binding.
    - Under `SSL certificate` vælges der `IIS Express Development Certificate`.
    - Under `Type` vælges der `https`

11. Åben projekt mappen på din disk. Åben `.umbraco`-filen, og ændre med navnet fra `.sln`.
12. Kør projektet via VS.
4. Åben nu backoffice og gå til Settings > Deploy. Du logger ind med samme bruger som på Import-projektet.
5. Tryk på 'Export Schema' (Den vil teknisk kører command: `echo > deploy-export`)
6. Nu opretter projektet uda-filer for alle Settings
   - Der kan være rod i uda-filer på child projekter af baseline. Får du uda-filer i source control, som ikke hører til nogle af projektets custom features, skal du følge steps herunder
   - Nogle bånd er oprettet med "ghost" dokumenttyper/datatyper, fx alias: ribbonPopup (korrekt GUID: 3da07c098ecc42d6966ce95d2821d2a1). Med "ghost" menes der dokumenttyper, som er forsøgt slettet og oprettet på ny i baseline, men content bruger stadig den slettede.
   - Gennemgå hver enkel uda-fil. Tjek her om de allerede er identificeret: https://github.com/umbracocoop/uSyncMigrations/tree/coop/migration#nogle-tips-til-umbraco-deploy-filerne
   - Hvis uda-fil er et bånd, som bliver oprettet på ny, skal du tjekke, hvor det bliver brugt. Brug det her endpoint i postman: https://medlem.coop.dk/umbraco/api/contentoverview/getjson?treshold=9999. Skift domæne ud med den løsning du sidder med.
   - Tilføj authentication: djn0amp9uwr*GYV8pue til header.
   - Søg i response efter fx båndets alias.
   - Hvis det bliver brugt, så vil der være x antal url'er i ContentUrls. Find tilsvarende side i Umbraco 10 løsningen og slet båndet. OBS: Noter gerne ned, hvad du sletter. Da det skal tilføjes igen om lidt.
   - Hvis du har slettet noget indhold, så fjern nu også de dokumenttyper der har været brugt
   - Alt, som ikke er custom features skal discard'es
   - Gå nu i backoffice og til Settings > Deploy. Tryk først på 'Clear Signatures' og dernæst 'Update Umbraco Schema'
   - Nu skal indholdet, du slettede tidligere, oprettes igen. Tjek med Umbraco 7 content.
8. Tjek at alt er som det skal være under Document Types, Data Types og at der er Content.
9. Commit filerne og se at det hele er kommet op i Umbraco Cloud, når den er færdig med comitted
10. Nu skal du transfer content fra local til live
   1. Højre klik på 'Content' og vælg 'Queue for transfer'
   2. Start overførelsen og hvis den fejler, så følg fejlbeskeden.
   3. Rinse and repeat
11. Hvis der har været problemer med rod i uda-filer, så tag gerne en ny backup fra live og overskriv din lokale. Så skulle ghost filerne gerne være helt væk.

### Next step
1. Flyt C# kode
2. Flyt styles, script, frontend m.m. Husk evt. Task Runner

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
12. Download "media" og indsæt det i din folder lokalt. Tjek at media virker.
13. Connect op til ASE mod de nye live data
14. Upload billederne, og tjek at de er kommet op på (det nye) live. 

## Umbraco Forms
Det er aftalt at Coop selv opretter forms i det nye Cloud projekt.

1. Opret en placeholder formular i Umbraco Cloud projektet
2. Vælg denne formular alle steder i content, hvor der er valgt en formular
   1. Notér alle steder hvor placeholder formularen er valgt, så Coop på bagkant kan erstatte dem

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

# Migrering af kode

## Opsæt child project fra baseline

1.	Omnavngiv Visual Studio projektet til ’Coop – [Superbrugsen]’
2.	Åbn projektet
3.	Tilføj connection string til din import database. Fx ’"umbracoDbDSN": "Server=.\\SQLEXPRESS19;Database=coop-om-coop-import;User Id=sa;Password=itsteatime-"’
4.	Gå eventuelt til punktet ‘Skub dine importerede data op i Cloud’
5.	Opret et nyt ’Website.Extensions’ projekt som et ’Class Library’
6.	Slet den ene Class.cs fil den opretter automatisk
7.	Installer nuget pakkerne:
a.	Umbraco.Cms.Core
b.	Umbraco.Cms.Web.BackOffice
c.	Umbraco.Cms.Web.Common
d.	Umbraco.Cms.Web.Website
8.	På ‘Website.Extensions’ opret project references til ‘Website.Baseline’ og ‘Common’
9.	På ‘Website’ pret project references til ‘Website.Extensions’
10.	Find eventuelle redirects i den gamle web.config og opret dem i det nye site. Bemærk at de kan være i både Web.config og Web.live.xdt.config
11.	Kopier koden fra det gamle ’Website.Extensions’ til det nye ’Website.Extensions’
12.	Fix det så det virker 😊

# Skub dine importerede data op i Cloud

Når dit nye projekt er koblet på din import-database kan du med Umbraco Deploy eksportere alle Settings til filer, som så kan comittes til Umbraco Cloud projektet.

1.	Åbn ’\src\Website\umbraco\Deploy’ mappen i det nye Cloud projekt
2.	Sørg også for at projektet kører på IIS’en
3.	Kør ’EchoDeployExport.bat’ hvorefter der gerne skulle dukke nogen filer op og slutte med en ’deploy-complete’ fil
4.	Tjek nu din source control for ændringer
5.	Nu skal du have comitted de ændringer der er korrekte og fjerne dem der er forkerte. Se næste 
6.	Når du er færdig med at fjerne de forkerte ændringer skal du nu køre en import af filerne igen. Det gør du ved at køre ’EchoDeploy.bat’ filen
7.	Prøv derefter at køre ’EchoDeployExport.bat’ igen så du kan sikre dig at ændringerne er blevet gjort

## Nogle tips til Umbraco Deploy filerne
1. Generelt
   1. Ændringer af databasetype skal som regel fjernes. Det har Baseline styr på
   1. Ændringer af navne og beskrivelser skal fjernes
   1. Der skal typisk ikke fjernes features
   1. Nye content types der skal kunne oprettes er fint
1. ‘Coop color picker’ (data-type__bcd43a32d8e340069e4b499b9ef75140.uda) Bare lad de ekstra farver komme med
1. ‘Komposition – Bånd’ document-type__0a480072838543fb8d876dadd929858d.uda) Den skal ikke ændre på ‘IsElementType’

### Umbraco deploy filer, der ikke skal med
1. Discard:
     1. **Video component** (d2bd65277f6847f386bc5ae8f1ce8fc8)
     2. **Videobånd** (c4397f5b604a41758820ff1bdf1fb244)
     3. **Chain** (bfce51fcd72c443bac5a1c4ab720672a)
     4. **Åbningstider** (bb4579a4707345d3b3d1aa965f6725b3)
     5. **Nyhedsbrev bånd** (697a273d62424fad859c93b1a63ce8b3)
     6. **Grid column** (52b2905cfda84a47a5738bca3135f9d6)
     7. **Komposition - Bånd** (0a480072838543fb8d876dadd929858d)
     8. **Ribbon picker** (e1eaeb3937aa4812b613a14ac3c3efa1) **Kan have custom bånd, de skal ikke slettes**
     9. **Richtext editor** (ca90c9500aff4e72b976a30b1ac57dad)
     10. **Relations** (ad7a501cc3134f609676a56987c83937)
     11. **Catalog page** (87383ecc0e5c41ce9dc14d9d9e080109)
     12. **Placering - Horisontalt og vertikalt** (861a8ed71d7b479e9d260b1f8ce7ac76)
     13. **Chain form picker** (7f0df461d09f495c9aeae658eb0cedf0)
     14. **Tags - Product** (458f5298b78f4567b37d281f383e2788)
     15. **Richtext editor (Simple, No formats)** (3f324bb3aedb4685a4e45ccef8971431)
     16. **Styles - Ribbon Catalog** (19d9a3d104264c37b01423d92903c6ca)
     17. **Generate guid** (08ad34669a8e4ded8253bc38e2662390)
20. Slet fra database og discard
    1. **Opskrifts strik** (cd4ec19885fa4c93b86eabcdeb810758)
    2. **Opskrifts idé** (a6887ca04e5c42d5a909522fad4491b9)
    3. **Logo med måned** (79c5b328b37a48ab8445f65e3ac13a5c)
    4. **Popup bånd** (56674685fbe44224b61e332b2410277e) **Kan godt have aktuel content**
    5. **Fly-in** (e6e5c6e745614502a5c6a8d1d5d6f171)
    6. **Fly-in picker** (ee33c02681d64156b376201f5de00d34)
    7. **Fly-in icon picker** (cc3b48348fcc49a183b803440d009b44)
    8. **Fly-in activation radio** (804e6b6b570943949fc15a5452354e7d)
    9. **Styles - Ribbon Kup Logo** (17e3670b5df541a4b949fabe4c262c4e)
    1. documentType alias: , documentType uda: document-type__4d844d911c5d4c3d8fcec5eac1cc37ae.uda
    1. template: Baseline_RecipeList, template__21382489a07d4bc191a9441dfe22bd9e.uda
    1. template: Baseline_RecipeKnit,template__ffddbc4fdd6748428f7fe9899fa7e545.uda
    1. template: Baseline_RecipeIdea, template__f2d1fc142e4a4d4aa1c8b574b996207a.uda
21. **Embed**
     1. ribbonEmbed, document-type__477cb5c749f2491f94863b82b77d4b06.uda
     1. "Name": "Style - Ribbon Embed (har ikke noget alias), data-type__25100aa9695542df98fb1bcd7cf439c8.uda
11. **Side**:
     1. Den skal ikke indeholde reference til 4d844d911c5d4c3d8fcec5eac1cc37ae
