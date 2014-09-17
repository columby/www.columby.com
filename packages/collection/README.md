README: Collection


#Model
- _id         : id
- title       : string
- slug        : string
- owner       : ref.accountId
- datasets    : [ref.datasetId]
- createdAt   : Date
- updatedAt   : Date
