const express = require("express");
const router = express.Router();
const ctrlAddress = require("../controllers/address");
const ctrlCreateAddress = require("../controllers/createAddress");


// Address routes
router.get("/address/:id", ctrlAddress.getAddressById);
router.get("/address", ctrlAddress.addressList);
router.post("/address", ctrlCreateAddress.addressCreate);
router.patch("/address/:id", ctrlAddress.updateAddress);
router.delete("/address/:id", ctrlAddress.deleteAddressById);


module.exports = router;
