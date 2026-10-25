/* =========================================
   SUPABASE HELPERS
========================================= */

const JoyCloud = (function createJoyCloud() {
    const PLACEHOLDER = "PASTE_YOUR_SUPABASE";
    const MEDIA_BUCKET = "user-media";
    const SIGNED_URL_SECONDS = 60 * 60 * 24;

    let client = null;

    function isConfigured() {
        const url = window.JOY_SUPABASE_URL || "";
        const key = window.JOY_SUPABASE_ANON_KEY || "";

        return (
            url.startsWith("https://") &&
            !url.includes(PLACEHOLDER) &&
            key.length > 20 &&
            !key.includes(PLACEHOLDER)
        );
    }

    function getClient() {
        if (!isConfigured()) {
            throw new Error(
                "Add your Supabase URL and anon key in config.js first."
            );
        }

        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            throw new Error("The Supabase library did not load.");
        }

        if (!client) {
            client = window.supabase.createClient(
                window.JOY_SUPABASE_URL,
                window.JOY_SUPABASE_ANON_KEY
            );
        }

        return client;
    }

    function friendlyError(error, fallback) {
        if (!error) {
            return fallback;
        }

        const message = error.message || fallback;

        if (/rate limit|security purposes/i.test(message)) {
            return "Please wait a moment before requesting another code.";
        }

        if (/invalid.*otp|expired|token/i.test(message)) {
            return "That code is incorrect or has expired. Try again.";
        }

        return message;
    }

    async function requireUser() {
        const supabase = getClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            throw new Error("Please sign in first.");
        }

        return data.user;
    }

    function fileExtension(file) {
        if (file.type === "image/jpeg") {
            return "jpg";
        }

        if (file.type === "image/png") {
            return "png";
        }

        if (file.type === "image/webp") {
            return "webp";
        }

        if (file.type === "image/gif") {
            return "gif";
        }

        const fromName = (file.name || "").split(".").pop();

        if (fromName && fromName.length <= 5) {
            return fromName.toLowerCase();
        }

        return "jpg";
    }

    async function signedUrl(path) {
        if (!path) {
            return "";
        }

        const supabase = getClient();
        const { data, error } = await supabase.storage
            .from(MEDIA_BUCKET)
            .createSignedUrl(path, SIGNED_URL_SECONDS);

        if (error) {
            console.error("Could not create a signed URL:", error);
            return "";
        }

        return data?.signedUrl || "";
    }

    function mapHappyItem(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description || "",
            category: row.category,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    function mapPhoto(row, imageUrl) {
        return {
            id: row.id,
            imageData: imageUrl,
            storagePath: row.storage_path,
            caption: row.caption || "A lovely memory",
            story: row.story || "",
            favorite: row.favorite === true,
            createdAt: row.created_at
        };
    }

    function mapPlaylist(row, coverUrl) {
        return {
            id: row.id,
            name: row.name,
            description: row.description || "",
            mood: row.mood,
            coverImage: coverUrl || "",
            coverPath: row.cover_path || "",
            spotifyId: row.spotify_id,
            spotifyUrl: row.spotify_url,
            favorite: row.favorite === true,
            createdAt: row.created_at
        };
    }

    async function sendMagicCode(email) {
        const supabase = getClient();
        const redirectUrl =
            `${window.location.origin}${window.location.pathname}`;

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: redirectUrl
            }
        });

        if (error) {
            throw new Error(friendlyError(error, "Could not send the code."));
        }
    }

    async function verifyMagicCode(email, token) {
        const supabase = getClient();
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email"
        });

        if (error) {
            throw new Error(friendlyError(error, "Could not verify that code."));
        }

        return data.session;
    }

    async function signOut() {
        const supabase = getClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(friendlyError(error, "Could not log out."));
        }
    }

    async function getSession() {
        if (!isConfigured()) {
            return null;
        }

        const supabase = getClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error(error);
            return null;
        }

        return data.session;
    }

    function onAuthChange(callback) {
        if (!isConfigured()) {
            return function stop() {};
        }

        const supabase = getClient();
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            callback(session);
        });

        return function stop() {
            data.subscription.unsubscribe();
        };
    }

    async function fetchProfile() {
        const user = await requireUser();
        const supabase = getClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("id, display_name, birthdate")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            throw new Error(friendlyError(error, "Could not load your profile."));
        }

        if (!data) {
            return null;
        }

        return {
            id: data.id,
            displayName: data.display_name,
            birthdate: data.birthdate
        };
    }

    function isProfileComplete(profile) {
        return Boolean(
            profile &&
            profile.displayName &&
            profile.displayName.trim() &&
            profile.birthdate
        );
    }

    async function saveProfile(displayName, birthdate) {
        const user = await requireUser();
        const supabase = getClient();
        const payload = {
            id: user.id,
            display_name: displayName.trim(),
            birthdate,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from("profiles")
            .upsert(payload, { onConflict: "id" })
            .select("id, display_name, birthdate")
            .single();

        if (error) {
            throw new Error(friendlyError(error, "Could not save your profile."));
        }

        return {
            id: data.id,
            displayName: data.display_name,
            birthdate: data.birthdate
        };
    }

    async function loadHappyItems() {
        const user = await requireUser();
        const supabase = getClient();
        const { data, error } = await supabase
            .from("happy_items")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(friendlyError(error, "Could not load the happy list."));
        }

        return (data || []).map(mapHappyItem);
    }

    async function saveHappyItem(item) {
        const user = await requireUser();
        const supabase = getClient();
        const payload = {
            user_id: user.id,
            title: item.title,
            description: item.description || "",
            category: item.category,
            updated_at: new Date().toISOString()
        };

        let result;

        if (item.id) {
            result = await supabase
                .from("happy_items")
                .update(payload)
                .eq("id", item.id)
                .eq("user_id", user.id)
                .select()
                .single();
        } else {
            result = await supabase
                .from("happy_items")
                .insert(payload)
                .select()
                .single();
        }

        if (result.error) {
            throw new Error(friendlyError(result.error, "Could not save that happy moment."));
        }

        return mapHappyItem(result.data);
    }

    async function deleteHappyItem(itemId) {
        const user = await requireUser();
        const supabase = getClient();
        const { error } = await supabase
            .from("happy_items")
            .delete()
            .eq("id", itemId)
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not delete that happy moment."));
        }
    }

    async function clearHappyItems() {
        const user = await requireUser();
        const supabase = getClient();
        const { error } = await supabase
            .from("happy_items")
            .delete()
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not clear the happy list."));
        }
    }

    async function loadPhotos() {
        const user = await requireUser();
        const supabase = getClient();
        const { data, error } = await supabase
            .from("photos")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(friendlyError(error, "Could not load photos."));
        }

        const photos = [];

        for (const row of data || []) {
            const imageUrl = await signedUrl(row.storage_path);
            photos.push(mapPhoto(row, imageUrl));
        }

        return photos;
    }

    async function savePhoto(file, caption, story) {
        const user = await requireUser();
        const supabase = getClient();
        const id = crypto.randomUUID();
        const path = `${user.id}/photos/${id}.${fileExtension(file)}`;

        const upload = await supabase.storage
            .from(MEDIA_BUCKET)
            .upload(path, file, {
                contentType: file.type || "image/jpeg",
                upsert: false
            });

        if (upload.error) {
            throw new Error(friendlyError(upload.error, "The photo could not be uploaded."));
        }

        const insert = await supabase
            .from("photos")
            .insert({
                id,
                user_id: user.id,
                storage_path: path,
                caption: caption || "A lovely memory",
                story: story || "",
                favorite: false
            })
            .select()
            .single();

        if (insert.error) {
            await supabase.storage.from(MEDIA_BUCKET).remove([path]);
            throw new Error(friendlyError(insert.error, "The photo could not be saved."));
        }

        const imageUrl = await signedUrl(path);
        return mapPhoto(insert.data, imageUrl);
    }

    async function updatePhoto(photo) {
        const user = await requireUser();
        const supabase = getClient();
        const { error } = await supabase
            .from("photos")
            .update({
                caption: photo.caption,
                story: photo.story,
                favorite: photo.favorite === true
            })
            .eq("id", photo.id)
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not update that photo."));
        }
    }

    async function deletePhoto(photo) {
        const user = await requireUser();
        const supabase = getClient();

        if (photo.storagePath) {
            await supabase.storage.from(MEDIA_BUCKET).remove([photo.storagePath]);
        }

        const { error } = await supabase
            .from("photos")
            .delete()
            .eq("id", photo.id)
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not delete that photo."));
        }
    }

    async function clearPhotos(photos) {
        const user = await requireUser();
        const supabase = getClient();
        const paths = (photos || [])
            .map((photo) => photo.storagePath)
            .filter(Boolean);

        if (paths.length > 0) {
            await supabase.storage.from(MEDIA_BUCKET).remove(paths);
        }

        const { error } = await supabase
            .from("photos")
            .delete()
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not clear the gallery."));
        }
    }

    async function loadPlaylists() {
        const user = await requireUser();
        const supabase = getClient();
        const { data, error } = await supabase
            .from("playlists")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(friendlyError(error, "Could not load playlists."));
        }

        const playlists = [];

        for (const row of data || []) {
            const coverUrl = await signedUrl(row.cover_path);
            playlists.push(mapPlaylist(row, coverUrl));
        }

        return playlists;
    }

    async function savePlaylist(playlist, coverFile) {
        const user = await requireUser();
        const supabase = getClient();
        let coverPath = playlist.coverPath || null;

        if (coverFile) {
            const coverId = crypto.randomUUID();
            coverPath = `${user.id}/covers/${coverId}.${fileExtension(coverFile)}`;

            const upload = await supabase.storage
                .from(MEDIA_BUCKET)
                .upload(coverPath, coverFile, {
                    contentType: coverFile.type || "image/jpeg",
                    upsert: false
                });

            if (upload.error) {
                throw new Error(friendlyError(upload.error, "The cover could not be uploaded."));
            }
        }

        const insert = await supabase
            .from("playlists")
            .insert({
                user_id: user.id,
                name: playlist.name,
                description: playlist.description || "",
                mood: playlist.mood,
                cover_path: coverPath,
                spotify_id: playlist.spotifyId,
                spotify_url: playlist.spotifyUrl,
                favorite: false
            })
            .select()
            .single();

        if (insert.error) {
            if (coverFile && coverPath) {
                await supabase.storage.from(MEDIA_BUCKET).remove([coverPath]);
            }

            if (/duplicate|unique/i.test(insert.error.message || "")) {
                throw new Error("This Spotify playlist is already in your collection.");
            }

            throw new Error(friendlyError(insert.error, "The playlist could not be saved."));
        }

        const coverUrl = await signedUrl(coverPath);
        return mapPlaylist(insert.data, coverUrl);
    }

    async function updatePlaylist(playlist) {
        const user = await requireUser();
        const supabase = getClient();
        const { error } = await supabase
            .from("playlists")
            .update({
                name: playlist.name,
                description: playlist.description,
                mood: playlist.mood,
                favorite: playlist.favorite === true
            })
            .eq("id", playlist.id)
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not update that playlist."));
        }
    }

    async function deletePlaylist(playlist) {
        const user = await requireUser();
        const supabase = getClient();

        if (playlist.coverPath) {
            await supabase.storage.from(MEDIA_BUCKET).remove([playlist.coverPath]);
        }

        const { error } = await supabase
            .from("playlists")
            .delete()
            .eq("id", playlist.id)
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not delete that playlist."));
        }
    }

    async function clearPlaylists(playlists) {
        const user = await requireUser();
        const supabase = getClient();
        const paths = (playlists || [])
            .map((playlist) => playlist.coverPath)
            .filter(Boolean);

        if (paths.length > 0) {
            await supabase.storage.from(MEDIA_BUCKET).remove(paths);
        }

        const { error } = await supabase
            .from("playlists")
            .delete()
            .eq("user_id", user.id);

        if (error) {
            throw new Error(friendlyError(error, "Could not clear playlists."));
        }
    }

    return {
        isConfigured,
        sendMagicCode,
        verifyMagicCode,
        signOut,
        getSession,
        onAuthChange,
        fetchProfile,
        isProfileComplete,
        saveProfile,
        loadHappyItems,
        saveHappyItem,
        deleteHappyItem,
        clearHappyItems,
        loadPhotos,
        savePhoto,
        updatePhoto,
        deletePhoto,
        clearPhotos,
        loadPlaylists,
        savePlaylist,
        updatePlaylist,
        deletePlaylist,
        clearPlaylists
    };
})();

window.JoyCloud = JoyCloud;
