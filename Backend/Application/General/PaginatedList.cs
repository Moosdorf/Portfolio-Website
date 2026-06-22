using Microsoft.EntityFrameworkCore;

namespace Backend.Application.General.Services;

public class PaginatedList<T> : List<T>
{
    public int PageIndex { get; private set; }
    public int TotalPages { get; private set; }
    public int TotalItems { get; private set; }

    public PaginatedList(List<T> items, int count, int pageIndex, int pageSize)
    {
        PageIndex = pageIndex;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalItems = count;
        this.AddRange(items);
    }

    public bool HasPreviousPage => PageIndex > 0;

    public bool HasNextPage => PageIndex+1 < TotalPages;

    public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int totalItem, int pageIndex, int pageSize)
    {
        var items = await source.ToListAsync();
        return new PaginatedList<T>(items, totalItem, pageIndex, pageSize);
    }
}
