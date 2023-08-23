﻿using System.Text.RegularExpressions;

namespace uSync.Migrations.Extensions;

public static class GuidExtensions
{
    private static readonly int[] _guidByteOrder = new[] { 15, 14, 13, 12, 11, 10, 9, 8, 6, 7, 4, 5, 0, 1, 2, 3 };

    // https://stackoverflow.com/q/1383030
    public static Guid Combine(this Guid guid1, Guid guid2)
    {
        var x = guid1.ToByteArray();
        var y = guid2.ToByteArray();

        var b = new byte[x.Length];

        for (var i = 0; i < b.Length; i++)
        {
            b[i] = (byte)(x[i] ^ y[i]);
        }

        return new Guid(b);
    }

    public static Guid Increment(this Guid guid)
    {
        var bytes = guid.ToByteArray();
        var carry = true;

        for (int i = 0; i < _guidByteOrder.Length && carry; i++)
        {
            int index = _guidByteOrder[i];
            byte oldValue = bytes[index]++;
            carry = oldValue > bytes[index];
        }

        return new Guid(bytes);
    }

    internal static Guid Int2Guid(this int value)
    {
        var bytes = new byte[16];
        BitConverter.GetBytes(value).CopyTo(bytes, 0);
        return new Guid(bytes);
    }

  public static string LocalLink2Udi( string value ) {
    string guidRegEx = @"(href|data-id)=""/?({|%7B)?(localLink:)?\b[A-Fa-f0-9]{8}(?:-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12}\b(}|%7D)?""";

    HashSet<string> uniqueMatches = new HashSet<string>();

    foreach ( Match m in Regex.Matches( value, guidRegEx ) ) {
      uniqueMatches.Add( m.Value );
    }

    foreach ( var guid in uniqueMatches ) {
      if ( guid.Contains( "data-id" ) ) {
        var newValue = guid.Replace( "data-id", "data-udi" ).Insert( 10, "umb://document/" );
        value = value.Replace( guid, newValue );
      } else if ( guid.Contains( "href" ) ) {
        var colonPos = guid.IndexOf( ':' );
        var newValue = guid.Insert( colonPos + 1, "umb://document/" );
        value = value.Replace( guid, newValue );
      }
    }
    return value;
  }
}
