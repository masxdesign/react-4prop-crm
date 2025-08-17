import { FOURPROP_LIVE_BASEURL } from "@/services/fourPropClient";
import isEmpty from "lodash/isEmpty";

const SIZES = {
    default: 1,
    small: 2,
    sm: 2
}

const getAvatarImageUrl = (user, size = "default") => {
    const { nid, picture } = user;

    // If picture is empty, return user with default avatars
    if (isEmpty(picture)) {
        return null;
    }

    // If picture exists, generate avatar URLs
    return `${FOURPROP_LIVE_BASEURL}/JSON/NIDs/NID/${nid}/${picture.replace("x", `/${SIZES[size]}.`, picture)}`;
};

export default getAvatarImageUrl;