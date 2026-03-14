using Microsoft.AspNetCore.Mvc;

namespace ThaoCamVienWeb.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return Redirect("/index.html");
        }
    }
}
