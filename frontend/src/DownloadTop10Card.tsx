import React from "react";

export function DownloadTop10Card({
  data,
  selectedType,
  userFirstName,
  timeRange,
  displayMode = false
}: {
  data: any[];
  selectedType: "tracks" | "artists" | "genres";
  userFirstName: string | null;
  timeRange: "short_term" | "medium_term" | "long_term";
  displayMode: boolean
}) {
  
  function getTimeRangeLabel(timeRange: string) {
    switch (timeRange) {
      case "short_term": return "in the past month";
      case "medium_term": return "in the past 6 months";
      default: return "of all time";
    }
  }

  const title =
    selectedType === "tracks"
      ? `${userFirstName}'s Top Tracks 💿`
      : selectedType === "artists"
      ? `${userFirstName}'s Top Artists 🧑‍🎤`
      : `${userFirstName}'s Top Genres 🎼`;

  const CARD_HEIGHT = 160;
  const GRID_GAP = 28;
  const TITLE_HEIGHT = 110;
  const TIME_LABEL_HEIGHT = 70;
  const GRID_HEIGHT = 1920 - TITLE_HEIGHT - TIME_LABEL_HEIGHT - 64;

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
        border: displayMode? "1px solid gray" : undefined,
        borderRadius: displayMode ? 20 : 0,
        boxShadow: displayMode ? "0 0 28px 0 rgba(0, 0, 0, 0.33)" : undefined 
      
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 66,
          fontWeight: 900,
          color: "#1f2937",
          textAlign: "center",
          height: TITLE_HEIGHT,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        {userFirstName && title}
      </div>

      <div
        style={{
          width: 1000,
     
          height: GRID_HEIGHT,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: GRID_GAP,
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {data.slice(0, 10).map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: 24,
              padding: "0 20px",
              boxSizing: "border-box",
              gap: 28,
              minWidth: 0,
              height: CARD_HEIGHT,
              width: "98%",
              boxShadow: "none",
              justifyContent: "flex-start",
            }}
          >
            {selectedType === "tracks" && item.albumCoverUrl && (
              <img
                src={item.albumCoverUrl}
                alt={item.name}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 18,
                  objectFit: "cover",
                  border: "none",
                  flexShrink: 0,
                }}
                crossOrigin="anonymous"
              />
            )}
            {selectedType === "artists" && item.artistImageUrl && (
              <img
                src={item.artistImageUrl}
                alt={item.name}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "none",
                  flexShrink: 0,
                }}
                crossOrigin="anonymous"
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                flex: 1,
                overflow: "hidden",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: "#22223B",
                  lineHeight: 1.12,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  marginBottom: 3,
                  maxWidth: 380,
                }}
              >
                {selectedType === "tracks"
                  ? item.name
                  : selectedType === "artists"
                  ? item.name
                  : item.genre}
              </div>
              {selectedType === "tracks" && (
                <div
                  style={{
                    fontSize: 21,
                    color: "#6B7280",
                    fontWeight: 500,
                    marginBottom: 2,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  by {item.artists}
                </div>
              )}
              {selectedType === "genres" && (
                <div
                  style={{
                    fontSize: 21,
                    color: "#6B7280",
                    fontWeight: 500,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {item.count} of your top 50 artists
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: "#888",
                marginLeft: 18,
                minWidth: 44,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              #{idx + 1}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 34,
          color: "#52525B",
          fontStyle: "italic",
          textAlign: "center",
          width: "100%",
          height: TIME_LABEL_HEIGHT,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          marginTop: 22,
        }}
      >
        {getTimeRangeLabel(timeRange)}
      </div>
    </div>
  );
}
