import React from "react";

export function DownloadGoatCard({
  data,
  selectedType,
  userFirstName,
  timeRange,
  displayMode = false
}) {
  
  function getTimeRangeLabel(timeRange) {
    switch (timeRange) {
      case "short_term": return "in the past month";
      case "medium_term": return "in the past 6 months";
      default: return "of all time";
    }
  }

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: "border-box",
        paddingTop: 220,
        position: "relative",
        border: displayMode? "1px solid gray" : undefined,
        borderRadius: displayMode ? 20 : 0,
        boxShadow: displayMode ? "0 0 28px 0 rgba(0, 0, 0, 0.33)" : undefined 
      }}
    >
      <div style={{ fontSize: 160, marginBottom: 60, opacity: 0.9, lineHeight: 1 }}>👑</div>

      {selectedType === "tracks" && data[0]?.albumCoverUrl && (
        <img
          src={data[0].albumCoverUrl}
          alt={data[0].name}
          style={{
            width: 850,
            height: 850,
            borderRadius: 80,
            objectFit: "cover",
            marginBottom: 60,
            boxShadow: "0 16px 64px rgba(0,0,0,0.10)",
          }}
          crossOrigin="anonymous"
        />
      )}

      {/* ARTIST */}
      {selectedType === "artists" && data[0]?.artistImageUrl && (
        <img
          src={data[0].artistImageUrl}
          alt={data[0].name}
          style={{
            width: 790,
            height: 790,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 60,
            boxShadow: "0 16px 64px rgba(0,0,0,0.10)",
          }}
          crossOrigin="anonymous"
        />
      )}

      {selectedType === "genres" && data[0]?.genreArtistImageUrls?.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 38,
          marginBottom: 46,
        }}>
          {data[0].genreArtistImageUrls.slice(0, 9).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Top artist ${idx + 1}`}
              style={{
                width: 240,
                height: 240,
                objectFit: "cover",
                borderRadius: 36,
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
              }}
              crossOrigin="anonymous"
            />
          ))}
        </div>
      )}

      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          color: "#1f2937",
          margin: "36px 0 22px 0",
          whiteSpace: "normal",
          wordBreak: "break-word",
          overflow: "visible",
          textOverflow: "unset",
          maxWidth: 1020,
          lineHeight: 1.08,
          textAlign: "center",
        }}
      >
        {selectedType === "genres" ? data[0]?.genre : data[0]?.name}
      </div>

      {/* Subtitle */}
      {selectedType === "tracks" && (
        <div style={{ fontSize: 60, color: "#6B7280", marginBottom: 0, lineHeight: 1.15 }}>
          by {data[0]?.artists}
        </div>
      )}
      {selectedType === "genres" && (
        <div style={{ fontSize: 50, color: "#6B7280", marginBottom: 0, lineHeight: 1.15 }}>
          {data[0]?.count} of your top 50 artists
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{
        fontSize: 46,
        color: "#52525B",
        textAlign: "center",
        fontStyle: "italic",
        marginBottom: 36,
        lineHeight: 1.13,
      }}>
        {selectedType === "tracks" && `${userFirstName}'s most listened to track ${getTimeRangeLabel(timeRange)}`}
        {selectedType === "artists" && `${userFirstName}'s GOAT artist ${getTimeRangeLabel(timeRange)}`}
        {selectedType === "genres" && `${userFirstName}'s most loved genre ${getTimeRangeLabel(timeRange)}`}
      </div>
    </div>
  );
}
