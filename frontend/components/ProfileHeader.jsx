import React from "react";
import Avatar from "./Avatar";
import Banner from "./Banner";

/**
 * ProfileHeader component for displaying user profile info.
 * Props:
 * - avatar: image URL
 * - fullName: user's full name
 * - username: user's username
 * - bio: user's bio
 * - details: array of { icon, label, value }
 * - onEdit: function to call when edit button is clicked (optional)
 * - isOwnProfile: boolean, if true shows edit button
 * - banner: banner image URL (optional)
 */
const ProfileHeader = ({
  avatar,
  fullName,
  username,
  bio,
  details = [],
  onEdit,
  isOwnProfile = false,
  banner,
}) => (
  <div className="bg-white shadow rounded-b-2xl">
    {/* Banner */}
    <div className="relative h-48 bg-gray-200">
      {banner && (
        <Banner
          src={banner}
          alt="Banner"
          className="w-full h-full"
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, width: "100%", height: "100%" }}
        />
      )}
      {/* Profile avatar */}
      <div
        className="absolute"
        style={{
          left: 32,
          bottom: -48,
          zIndex: 10,
          width: 112,
          height: 112,
          borderRadius: "50%",
          border: "4px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          overflow: "hidden",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          src={avatar}
          alt={fullName}
          size={104}
          profileUrl={username ? `${window.location.origin}/user/${username}` : undefined}
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>
      {/* Edit profile button */}
      {isOwnProfile && (
        <button
          className="absolute right-8 bottom-4 border border-gray-300 rounded-full px-4 py-1 font-semibold text-sm bg-white hover:bg-gray-100 shadow"
          style={{ zIndex: 11 }}
          onClick={onEdit}
        >
          Edit profile
        </button>
      )}
    </div>
    {/* Profile main info */}
    <div className="pt-12 px-6 pb-4">
      <div className="pl-1">
        <div className="text-2xl font-bold text-gray-900 leading-tight">{fullName}</div>
        <div className="text-base text-gray-500 leading-tight mb-1">@{username}</div>
      </div>
      {/* Bio */}
      <div className="mt-4 text-gray-900">{bio}</div>
      {/* Details */}
      <div className="flex flex-wrap gap-4 text-gray-500 text-sm mt-3">
        {details.map((item, idx) => (
          <span key={idx}>
            {item.icon && (
              <span role="img" aria-label={item.label} className="mr-1">
                {item.icon}
              </span>
            )}
            {item.value}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default ProfileHeader;
