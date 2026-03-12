using Microsoft.AspNetCore.Mvc;
using ThaoCamVienWeb.Models;

public class PoiController : Controller
{
    private readonly WebContext _context;

    public PoiController(WebContext context)
    {
        _context = context;
    }

    public IActionResult Index()
    {
        var data = _context.Pois.ToList();
        return View(data);
    }
}