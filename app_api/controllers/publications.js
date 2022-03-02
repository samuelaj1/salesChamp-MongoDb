const mongoose = require("mongoose");
const Publication = mongoose.model("Publication");
const Publisher = mongoose.model("Publisher");

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
};

function findPublisher(req, res, cb) {
    Publisher
        .findById(req.body.publisher)
        .select("content_type frequency prices")
        .exec((err, publisher) => {
            if (err) {
                console.log(err,'error g')
                sendJsonResponse(res, 404, err);
                return;
            } else if (!publisher) {
                sendJsonResponse(res, 404, {
                    "message": "publisherid not found"
                });
                return;
            }
            if (publisher.content_type === `${req.body.type}s`) {
                cb(publisher);
            } else {
                console.log('here')
                console.debug(publisher.content_type, `${req.body.type}s`);
                console.debug(publisher.frequency, req.body.frequency)
                sendJsonResponse(res, 401, {
                    "message": "Publisher cannot publish such content"
                });
            }
        });
};

module.exports.publicationsCreate = function (req, res, next) {

    if (req.body) {
        Publisher.findById(req.body.publisher).exec((err, publisher) => {
            if (!publisher) {
                sendJsonResponse(res, 404, {message: "publisherid not found"});

                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }

            let requestTags = ((req.body||{}).tags ||[]);
            let tags = [];
            requestTags.forEach((tag) => {
                tags.push(tag.toLowerCase().trim());
            });
            
            console.log(req.files['pdf_file'][0]['path'],'path')
            console.log(req.files['cover_image'][0]['path'],'path')
            

            Publication.create({
                title: req.body.title,
                cover_image: req.files['cover_image'] ? process.env.host + req.files['cover_image'][0]['path'] : '',
                pdf_file: req.files['pdf_file'] ? process.env.host + req.files['pdf_file'][0]['path'] : '',
                description: req.body.description,
                publisher: publisher._id,
                price: req.body.price,
                author: req.body.author,
                content_type: publisher.content_type,
                releaseDate: req.body.releaseDate,
                timeAvailable: req.body.timeAvailable,
                tags: tags,
                genre: req.body.genre,
                language: req.body.language,
                countryOfOrigin: req.body.countryOfOrigin,
                isbn: req.body.isbn,
                edition: req.body.edition,
                issue: req.body.issue
            }, (err, publication) => {
                if (err) {
                    console.log("error here", err);
                    console.error(err);
                    sendJsonResponse(res, 401, err);
                } else { // Add edition number
                    console.log("Publication created");
                    sendJsonResponse(res, 200, publication);
                }
            });
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No body in request"
        });
    }
};


module.exports.publicationsList = function (req, res, next) {
    let title = req.query.title;
    let publisherid = req.query.publisherid;
    let type = req.query.type;
    let tag = req.query.tag;
    let fromDate = req.query.fromdate;
    let query = {};
    if (title) query.title = title;
    if (publisherid) query.publisher = publisherid;
    if (type) query.content_type = type;
    if (tag) query.tags = tag;
    Publication
        .find(query)
        // .populate('creator_id')
        .exec(
            (err, results) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    let publications = [];
                    // console.log(results)
                    results.forEach(doc => {
                        let docDate = new Date(doc.created_at);
                        let queryDate = new Date(fromDate);
                        if (queryDate <= docDate) {
                            if (tag) {
                                let index = doc.tags.indexOf(tag);
                                if (index) {
                                    publications.push({
                                        id: doc._id,
                                        title: doc.title,
                                        image: doc.image,
                                        file: doc.file,
                                        summary: doc.summary,
                                        publisher: doc.publisher,
                                        rating: doc.rating,
                                        downloads: doc.downloads,
                                        prices: doc.prices,
                                        author: doc.author,
                                        isbn: doc.isbn,
                                        edition: doc.edition,
                                        issue: doc.issue,
                                        content_type: doc.content_type,
                                        frequency: doc.frequency,
                                        sales: doc.sales,
                                        views: doc.views,
                                        likes: doc.likes,
                                        tags: doc.tags,
                                        genre: doc.genre,
                                        language: doc.language,
                                        country: doc.country,
                                        pages: doc.pages,
                                        comments: doc.comments,
                                        created_at: doc.created_at,
                                        release_date: doc.release_date,
                                        time_avaliable: doc.time_available
                                    });
                                }
                            } else {
                                publications.push({
                                    id: doc._id,
                                    title: doc.title,
                                    image: doc.image,
                                    file: doc.file,
                                    summary: doc.summary,
                                    publisher: doc.publisher,
                                    rating: doc.rating,
                                    downloads: doc.downloads,
                                    prices: doc.prices,
                                    author: doc.author,
                                    isbn: doc.isbn,
                                    edition: doc.edition,
                                    issue: doc.issue,
                                    content_type: doc.content_type,
                                    frequency: doc.frequency,
                                    sales: doc.sales,
                                    views: doc.views,
                                    likes: doc.likes,
                                    tags: doc.tags,
                                    genre: doc.genre,
                                    language: doc.language,
                                    country: doc.country,
                                    pages: doc.pages,
                                    comments: doc.comments,
                                    created_at: doc.created_at,
                                    release_date: doc.release_date,
                                    time_avaliable: doc.time_available
                                });
                            }
                        } else {
                            publications.push({
                                id: doc._id,
                                title: doc.title,
                                image: doc.image,
                                file: doc.file,
                                cover_image:doc.cover_image,
                                pdf_file:doc.pdf_file,
                                description: doc.description,
                                publisher: doc.publisher,
                                rating: doc.rating,
                                downloads: doc.downloads,
                                price: doc.prices,
                                author: doc.author,
                                isbn: doc.isbn,
                                edition: doc.edition,
                                issue: doc.issue,
                                content_type: doc.content_type,
                                frequency: doc.frequency,
                                sales: doc.sales,
                                views: doc.views,
                                likes: doc.likes,
                                tags: doc.tags,
                                genre: doc.genre,
                                language: doc.language,
                                country: doc.country,
                                pages: doc.pages,
                                comments: doc.comments,
                                created_at: doc.created_at,
                                release_date: doc.release_date,
                                time_avaliable: doc.time_available
                            });
                        }
                    });
                    // console.log(publications)
                    sendJsonResponse(res, 201, publications);
                }
            }
        );
};

module.exports.publicationsReadOne = function (req, res, next) {
    if (req.params && req.params.publicationid) {
        Publication
            .findById(req.params.publicationid)
            .exec(
                (err, publication) => {
                    if (!publication) {
                        console.warn("publicationid not found");
                        sendJsonResponse(res, 404, {
                            "message": "publicationid not found"
                        });
                        return;
                    } else if (err) {
                        console.error(err);
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    console.log("Publication found");
                    sendJsonResponse(res, 201, publication);
                }
            )
    } else {
        sendJsonResponse(res, 404, {
            "message": "No publicationid in request"
        });
    }
};

module.exports.publicationsDownloadOne = function (req, res, next) {
    if (req.params && req.params.publicationid) {
        Publication
            .findById(req.params.publicationid)
            .select("file title downloads")
            .exec((err, publication) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else if (!publication) {
                    sendJsonResponse(res, 404, {
                        "message": "publicationid not found"
                    });
                    return;
                }
                res.download(publication.file, `${publication.title}.pdf`, function (err) {
                    if (err) {
                        console.log("Download failed")
                    } else {
                        publication.downloads++;
                        publication.save((err, publication) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log("Downloads incremented");
                            }
                        });
                    }
                });
            });
    }
};

module.exports.publicationsUpdateOne = function (req, res, next) {
    if (!req.params.publicationid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, publicationid is required"
        });
        return;
    }
    Publication
        .findById(req.params.publicationid)
        .select('title image summary tags prices author issue edition')
        .exec(
            (err, publication) => {
                if (!publication) {
                    sendJsonResponse(res, 404, {
                        "message": "publicationid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                publication.title = req.body.title ? req.body.title : publication.title;
                publication.image = req.files ? req.files[0].path : publication.image;
                publication.summary = req.body.summary ? req.body.summary : publication.summary;
                publication.tags = tags ? tags : publication.tags;
                publication.prices = prices ? prices : publication.prices;
                publication.author = req.body.author ? req.body.author : publication.author;
                publication.issue = req.body.issue ? req.body.issue : publication.issue;
                publication.edition = req.body.edition ? req.body.edition : publication.edition;

                publication.save((err, publication) => {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, publication);
                    }
                });
            }
        );
};

module.exports.publicationsDeleteOne = function (req, res, next) {
    let publicationid = req.params.publicationid;
    if (publicationid) {
        Publication
            .findByIdAndRemove(publicationid)
            .exec((err, publication) => {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 204, null);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No publicationid"
        });
    }
};
