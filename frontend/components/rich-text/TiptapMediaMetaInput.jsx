import React from "react";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";

const TiptapMediaMetaInput = ({
  selectedMedia,
  setSelectedMedia,
  mediaTitleInput,
  setMediaTitleInput,
  selectedThumbnail,
  setSelectedThumbnail,
  editor,
  mini = false,
  hideTitleInput = false,
}) => {
  if (!selectedMedia) return null;

  // MINI MODE: compact row with small input, thumbnail selector, and preview
  if (mini) {
    return (
      <div className="flex items-center gap-2 mb-1">
        {!hideTitleInput && (
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-200"
            placeholder="Title"
            value={mediaTitleInput}
            style={{ width: 80, minWidth: 0, fontSize: 12 }}
            onChange={e => setMediaTitleInput(e.target.value)}
            onFocus={() => {
              setMediaTitleInput(selectedMedia.title || "");
            }}
            onBlur={e => {
              const newTitle = e.target.value;
              setSelectedMedia({ ...selectedMedia, title: newTitle });
              if (editor && editor.state && selectedMedia && selectedMedia.src) {
                const { state, view } = editor;
                let tr = state.tr;
                let found = false;
                state.doc.descendants((node, pos) => {
                  if (
                    ["audio", "video", "image", "pdfembed"].includes(node.type.name) &&
                    node.attrs &&
                    node.attrs.src === selectedMedia.src &&
                    !found
                  ) {
                    tr = tr.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      title: newTitle
                    });
                    found = true;
                    return false;
                  }
                  return true;
                });
                if (found) {
                  view.dispatch(tr);
                  editor.commands.focus('end');
                }
              }
            }}
          />
        )}
        {(selectedMedia?.type === "audio" || selectedMedia?.type === "video") && (
          <label className="flex flex-col items-center justify-center border border-gray-300 rounded cursor-pointer p-1 hover:border-blue-400 transition-all" style={{ width: 50, minWidth: 0 }}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async e => {
                const file = e.target.files[0];
                setSelectedThumbnail(file || null);
                if (file && selectedMedia) {
                  // Upload thumbnail to backend and associate with media
                  const formData = new FormData();
                  formData.append("thumbnail", file);
                  formData.append("media_url", selectedMedia.src);
                  const res = await fetch("/api/posts/upload-thumbnail", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();
                  if (data && data.thumbnail) {
                    setSelectedMedia({ ...selectedMedia, thumbnail: data.thumbnail });
                    // Do NOT clear selectedThumbnail in mini mode so preview remains visible
                    if (!mini) setSelectedThumbnail(null);
                  } else {
                    alert("Failed to upload thumbnail.");
                  }
                }
              }}
            />
            <span className="text-lg text-gray-400">
              <MdOutlineAddPhotoAlternate />
            </span>
            <span className="text-[10px] text-gray-500 leading-tight mt-0.5">
              {selectedThumbnail ? "Change thumbnail" : "Thumbnail"}
            </span>
          </label>
        )}
      </div>
    );
  }

  // DEFAULT MODE
  return (
    <div className="mb-2">
      <input
        type="text"
        className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter media title"
        value={mediaTitleInput}
        onChange={e => setMediaTitleInput(e.target.value)}
        onFocus={() => {
          setMediaTitleInput(selectedMedia.title || "");
        }}
        onBlur={e => {
          const newTitle = e.target.value;
          setSelectedMedia({ ...selectedMedia, title: newTitle });
          // Use Tiptap's transaction API to update the title attribute of the correct media node
          if (editor && editor.state && selectedMedia && selectedMedia.src) {
            const { state, view } = editor;
            let tr = state.tr;
            let found = false;
            state.doc.descendants((node, pos) => {
              if (
                ["audio", "video", "image", "pdfembed"].includes(node.type.name) &&
                node.attrs &&
                node.attrs.src === selectedMedia.src &&
                !found
              ) {
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  title: newTitle
                });
                found = true;
                return false; // stop after first match
              }
              return true;
            });
            if (found) {
              view.dispatch(tr);
              editor.commands.focus('end');
            }
          }
        }}
      />
      {(selectedMedia?.type === "audio" || selectedMedia?.type === "video") && (
        <div className="mt-4">
          <div className="font-semibold text-base text-gray-800 mb-1">Thumbnail</div>
          <div className="text-sm text-gray-500 mb-2">Set a thumbnail that stands out</div>
          <label
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-all"
            style={{ minHeight: 120 }}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async e => {
                const file = e.target.files[0];
                setSelectedThumbnail(file || null);
                if (file && selectedMedia) {
                  // Upload thumbnail to backend and associate with media
                  const formData = new FormData();
                  formData.append("thumbnail", file);
                  formData.append("media_url", selectedMedia.src);
                  const res = await fetch("/api/posts/upload-thumbnail", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();
                  if (data && data.thumbnail) {
                    setSelectedMedia({ ...selectedMedia, thumbnail: data.thumbnail });
                    setSelectedThumbnail(null);
                  } else {
                    alert("Failed to upload thumbnail.");
                  }
                }
              }}
            />
            {!selectedThumbnail ? (
              <div className="flex flex-col items-center">
                <span className="text-4xl text-gray-400 mb-2">
                  <MdOutlineAddPhotoAlternate />
                </span>
                <span className="text-gray-700 font-medium">Upload file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={URL.createObjectURL(selectedThumbnail)}
                  alt="Thumbnail preview"
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
                />
                <span className="text-xs text-gray-600 mb-2">{selectedThumbnail.name}</span>
                <button
                  className="text-red-500 hover:text-red-700 text-xs border border-red-200 rounded px-2 py-1"
                  onClick={e => {
                    e.preventDefault();
                    setSelectedThumbnail(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
};

export default TiptapMediaMetaInput;
