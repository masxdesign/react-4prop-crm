function PropertyCompanySm({ logo, name }) {
    return (
      <div className="flex gap-3">
        <div className='text-xs text-muted-foreground'>{name}</div>
        {logo ? (
          <div className='bg-slate-100 max-w-12 flex justify-center items-center self-start'>
            <img src={logo} className='max-h-4 object-cover' />
          </div>
        ) : (
          <div className='bg-slate-100 flex items-center justify-center text-slate-400 h-4'>
            <span className="block text-xs p-1">No logo</span>
          </div>
        )}
      </div>
    )
}

export default PropertyCompanySm