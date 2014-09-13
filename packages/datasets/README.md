README: datasets

## Dataset model
 _id              ' '
 publisher {
   type: 'user/organisation',
   account: {
     type           accountType._id
     ref            accountType
   }
 }

 Title            ' '
 Slug             ' '
 Description      ' '
 etc ...

functions
  transferOwnership('type', 'id')
    // Check if possible (account plan)
    // Also change in user's/organisation's list (User.removeDataset, User.addDataset)
