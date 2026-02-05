import React, { FC } from "react";

type Props = {
  videoUrl: string;
  title: string;
};

const CoursePlayer: FC<Props> = ({ videoUrl }) => {
  // Note: This component uses Google Drive for video playback
  // VdoCipher integration has been removed as it's not being used


  return (
    <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
      {(
        <iframe
          src={`https://drive.google.com/file/d/${videoUrl}/preview`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0
          }}
          allowFullScreen={true}
          allow="encrypted-media"
        ></iframe>
      )}
    </div>
  );
};

export default CoursePlayer;
