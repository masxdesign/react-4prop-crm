function PropertyCompany({ logo, name }) {
    return (
      <>
        <div className='text-xs text-center text-muted-foreground'>{name}</div>
        {logo ? (
          <div className='bg-slate-50 p-2 w-full flex justify-center items-center self-start'>
            <img src={logo} className='max-h-12 object-cover' />
          </div>
        ) : (
          <div className='bg-slate-50 p-2 flex items-center justify-center font-bold text-slate-400 h-12'>
            <span>No logo</span>
          </div>
        )}
      </>
    )
}

export default PropertyCompany