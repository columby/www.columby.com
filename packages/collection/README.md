README: Collection


#Model
- _id         : id
- title       : string
- slug        : string
- owner       : ref.userId
- datasets    : [ref.datasetId]
- createdAt   : Date
- updatedAt   : Date
