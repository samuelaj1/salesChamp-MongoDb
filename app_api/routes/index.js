const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const passport = require("passport");
const router = express.Router();
const ctrlUser = require("../controllers/users");
const ctrlPublisher = require("../controllers/publishers");
const ctrlReader = require("../controllers/readers");
const ctrlCart = require("../controllers/carts");
const ctrlComment = require("../controllers/comments");
const ctrlPublications = require("../controllers/publications");
const ctrlLibraries = require("../controllers/libraries");
const ctrlPayments = require("../controllers/payments");
const ctrlPayouts = require("../controllers/payouts");
const ctrlOthers = require("../controllers/others");

let profilePhotoStorage = multer.diskStorage({
    destination: "./uploads/profile-photos",
    filename: function (req, file, cb) {
        let name = crypto.randomBytes(10).toString("hex") + Date.now() + ".png";
        cb(null, name);
    }
});

let mediaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "cover_image") {
            return cb(null, "./uploads/publication-covers");
        }
        if (file.fieldname === "pdf_file") {
            cb(null, "./uploads/publication-files");
        }
    },
    filename: function (req, file, cb) {
        let name = crypto.randomBytes(10).toString("hex") + Date.now();
        if (file.fieldname === "cover_image") {
            name = name + ".png";
        } else {
            name = name + ".pdf";
        } cb(null, name);
    }
});

router.get("/sendmail", ctrlUser.sendmail);

// Users
router.post("/users/register", multer({storage: profilePhotoStorage}).single("photo"), ctrlUser.register);
router.post("/users/login", ctrlUser.login);
router.post("/users/settings", ctrlUser.settings);
router.post("/upload", multer({storage: profilePhotoStorage}).single("files"), ctrlUser.uploadImage);
router.get("/users/verify/:userid/:secretcode/:type", ctrlUser.verify);
router.post("/users/logout", ctrlUser.logout);

// Publishers
router.get("/publishers", passport.authenticate("jwt", {session: false}), ctrlPublisher.publishersList);
router.post("/publishers", passport.authenticate("jwt", {session: false}), ctrlPublisher.publishersCreate);
router.post("/save-publisher-pricing", passport.authenticate("jwt", {session: false}), ctrlPublisher.savePricingOptions);
router.get("/publishers/:publisherid", passport.authenticate("jwt", {session: false}), ctrlPublisher.publishersReadOne);
router.put("/publishers/:publisherid", passport.authenticate("jwt", {session: false}), multer({storage: profilePhotoStorage}).single("file"), ctrlPublisher.publishersUpdateOne);

// Readers
router.get("/readers", passport.authenticate("jwt", {session: false}), ctrlReader.readersList);
router.post("/readers", passport.authenticate("jwt", {session: false}), ctrlReader.readersCreate);
router.get("/readers/:readerid", passport.authenticate("jwt", {session: false}), ctrlReader.readersReadOne);
router.put("/readers/:readerid", multer({storage: profilePhotoStorage}).single("photo"), ctrlReader.readersUpdateOne);

// Library
router.get("/readers/:readerid/library", passport.authenticate("jwt", {session: false}), ctrlLibraries.librariesList);
router.post("/readers/:readerid/library", passport.authenticate("jwt", {session: false}), ctrlLibraries.addToLibrary);

// Cart
router.get("/readers/:readerid/cart", passport.authenticate("jwt", {session: false}), ctrlCart.cartsList);
router.post("/readers/:readerid/cart", passport.authenticate("jwt", {session: false}), ctrlCart.addToCart);
router.post("/readers/:readerid/cart/checkout", passport.authenticate("jwt", {session: false}), ctrlCart.checkout);
router.delete("/readers/:readerid/cart/:itemid", ctrlCart.removeFromCart);

// Publications
router.get("/publications", passport.authenticate("jwt", {session: false}), ctrlPublications.publicationsList);
router.post("/publications", passport.authenticate("jwt", {session: false}), multer({storage: mediaStorage}).fields([
    {
        name: "cover_image",
        maxCount: 1
    }, {
        name: "pdf_file",
        maxCount: 1
    },
]), ctrlPublications.publicationsCreate);
router.get("/publications/:publicationid", passport.authenticate("jwt", {session: false}), ctrlPublications.publicationsReadOne);
router.put("/publications/:publicationid", passport.authenticate("jwt", {session: false}), multer({storage: mediaStorage}).fields([
    {
        name: "cover_image",
        maxCount: 1
    }, {
        name: "pdf_file",
        maxCount: 1
    },
]), ctrlPublications.publicationsUpdateOne);
router.delete("/publications/:publicationid", passport.authenticate("jwt", {session: false}), ctrlPublications.publicationsDeleteOne);
router.get("/publications/:publicationid/download", passport.authenticate("jwt", {session: false}), ctrlPublications.publicationsDownloadOne);

// Comments
router.get("/publications/:publicationid/comments/:commentid", passport.authenticate("jwt", {session: false}), ctrlComment.commentsReadOne);
router.post("/publications/:publicationid/comments/", passport.authenticate("jwt", {session: false}), ctrlComment.commentsCreate);

// Payments
router.get("/payments", passport.authenticate("jwt", {session: false}), ctrlPayments.paymentsList);
router.post("/payments", passport.authenticate("jwt", {session: false}), ctrlPayments.paymentsCreate);

// Payouts
router.get("/payouts", passport.authenticate("jwt", {session: false}), ctrlPayouts.payoutsList);
router.post("/payouts", passport.authenticate("jwt", {session: false}), ctrlPayouts.payoutsCreate);
router.get("/payouts/:payoutid", passport.authenticate("jwt", {session: false}), ctrlPayouts.payoutsReadOne);
router.put("/payouts/:payoutid", passport.authenticate("jwt", {session: false}), ctrlPayouts.payoutsUpdateOne);

// Others
router.post("/publications/:publicationid/favourite", passport.authenticate("jwt", {session: false}), ctrlOthers.favourite);
router.get("/readers/:readerid/wishlist", passport.authenticate("jwt", {session: false}), ctrlOthers.viewWishlist);
router.post("/readers/:readerid/wishlist", passport.authenticate("jwt", {session: false}), ctrlOthers.addToWishlist);
router.delete("/readers/:readerid/wishlist/:item", passport.authenticate("jwt", {session: false}), ctrlOthers.removeFromWishlist);

module.exports = router;
