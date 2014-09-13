#User


## User model
 _id
 Email            ' '
 Name             ' '
 Slug             ' '
 Description      ' '
 Plan
   type           ' '
 Datasets         [{
   type: dataset._id,
   ref: 'Dataset'
   ]}
 Organisations    [{
   type: organisation._id,
   ref: 'Organisation'
   }]


## Organisation model
 _id              ' '
 Owner            ref -> user._id
 Datasets         [{
   type: dataset._id,
   ref: 'Dataset'
   }]

  Name             ' '
  Slug             ' '
  Description      ' '
