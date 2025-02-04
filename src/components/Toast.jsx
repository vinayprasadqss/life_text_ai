import Swal from "sweetalert2";

const Toast = (title = "Notification", msg = "", icon = "info") => {
    Swal.fire({
        title,
        text: msg,
        icon, // Can be "success", "error", "warning", "info"
        confirmButtonText: "OK", // User must click to close
    });
};

export default Toast;
